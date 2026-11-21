"""Tests de la base Clipera : permissions (RLS), quotas atomiques, file de traitements.

Ils tournent sur un Postgres local qui imite Supabase (voir supabase_stub.sql).
Variable requise : CLIPERA_TEST_DB_ADMIN_URL (connexion superutilisateur à un serveur de test).
"""

from __future__ import annotations

import os
import pathlib
import threading
import uuid

import psycopg
import pytest
from psycopg import errors

ROOT = pathlib.Path(__file__).resolve().parents[2]
ADMIN_URL = os.environ.get("CLIPERA_TEST_DB_ADMIN_URL")
DB_NAME = "clipera_pytest"

pytestmark = pytest.mark.skipif(not ADMIN_URL, reason="CLIPERA_TEST_DB_ADMIN_URL non défini")


def _db_url() -> str:
    return psycopg.conninfo.make_conninfo(ADMIN_URL, dbname=DB_NAME)


@pytest.fixture(scope="session", autouse=True)
def database():
    with psycopg.connect(ADMIN_URL, autocommit=True) as c:
        c.execute(f"drop database if exists {DB_NAME} with (force)")
        c.execute(f"create database {DB_NAME}")
    with psycopg.connect(_db_url(), autocommit=True) as c:
        c.execute((ROOT / "supabase/tests/supabase_stub.sql").read_text())
        for f in sorted((ROOT / "supabase/migrations").glob("*.sql")):
            c.execute(f.read_text())
        # Offre de test : beaucoup de jobs simultanés, peu de vidéos → teste la course au quota.
        c.execute(
            """insert into plans (id, name, price_cents, monthly_source_videos, monthly_source_seconds,
               max_clips_per_video, max_video_seconds, max_upload_bytes, export_max_height, max_concurrent_jobs,
               is_public)
               values ('race', 'Race', 0, 4, 100000, 5, 100000, 1000000, 1080, 50, false)"""
        )
    yield


def admin():
    return psycopg.connect(_db_url(), autocommit=True)


class As:
    """Connexion qui se comporte comme un utilisateur Supabase (rôle + JWT)."""

    def __init__(self, user_id: uuid.UUID | None, role: str = "authenticated"):
        self.conn = psycopg.connect(_db_url(), autocommit=True)
        self.conn.execute(f"set role {role}")
        if user_id:
            self.conn.execute("select set_config('request.jwt.claim.sub', %s, false)", (str(user_id),))

    def q(self, sql, params=None):
        cur = self.conn.execute(sql, params)
        return cur.fetchall() if cur.description else None

    def close(self):
        self.conn.close()


def make_user(plan: str = "free") -> uuid.UUID:
    uid = uuid.uuid4()
    with admin() as c:
        c.execute("insert into auth.users (id, email) values (%s, %s)", (uid, f"{uid}@test.local"))
        if plan != "free":
            c.execute(
                """update subscriptions set plan_id = %s, current_period_start = now() - interval '1 day',
                   current_period_end = now() + interval '29 days' where user_id = %s""",
                (plan, uid),
            )
    return uid


def make_video(uid: uuid.UUID, duration: float = 600.0, status: str = "validated") -> uuid.UUID:
    with admin() as c:
        pid = c.execute("insert into projects (user_id) values (%s) returning id", (uid,)).fetchone()[0]
        vid = c.execute(
            """insert into source_videos (project_id, user_id, status, storage_key, original_filename,
               declared_size_bytes, duration_seconds, rights_confirmed_at)
               values (%s, %s, %s, %s, 'test.mp4', 1000, %s, now()) returning id""",
            (pid, uid, status, f"sources/{uid}/{uuid.uuid4()}.mp4", duration),
        ).fetchone()[0]
    return vid


def create_job(user: As, vid, clips=5, key=None):
    return user.q(
        "select id, status from create_clip_job(%s, %s, '{}'::jsonb, %s)",
        (vid, clips, key or f"key-{uuid.uuid4()}"),
    )[0]


def set_status(job_id, status, clips_produced=0):
    with admin() as c:
        c.execute(
            "update processing_jobs set status = %s, clips_produced = %s where id = %s",
            (status, clips_produced, job_id),
        )


def quota(user: As):
    return user.q("select videos_used, videos_limit, seconds_used, seconds_limit from my_quota()")[0]


# ───────────────────────── Permissions ─────────────────────────


def test_signup_creates_profile_settings_and_free_plan():
    uid = make_user()
    u = As(uid)
    assert u.q("select plan_id, status from subscriptions") == [("free", "active")]
    assert len(u.q("select * from profiles")) == 1
    assert len(u.q("select * from user_settings")) == 1
    u.close()


def test_users_cannot_see_each_other():
    a, b = make_user(), make_user()
    vid_b = make_video(b)
    ub = As(b)
    create_job(ub, vid_b)
    ua = As(a)
    for table in ("projects", "source_videos", "processing_jobs", "job_events", "usage_records",
                  "subscriptions", "profiles"):
        rows = ua.q(f"select user_id from {table}" if table != "profiles" else "select id from profiles")
        assert all(r[0] == a for r in rows), table
    assert ub.q("select count(*) from processing_jobs")[0][0] == 1
    ua.close(), ub.close()


def test_anon_sees_public_plans_only():
    anon = As(None, role="anon")
    ids = {r[0] for r in anon.q("select id from plans")}
    assert ids == {"free", "starter", "pro", "ultimate"}
    with pytest.raises(errors.InsufficientPrivilege):
        anon.q("select * from projects")
    anon.close()


@pytest.mark.parametrize(
    "sql",
    [
        "insert into usage_records (user_id, kind, period_start, source_videos, source_seconds) "
        "values (auth.uid(), 'adjust', now(), -100, -100000)",
        "update subscriptions set plan_id = 'ultimate'",
        "update source_videos set status = 'validated'",
        "update processing_jobs set status = 'completed'",
        "update profiles set is_admin = true",
        "insert into processing_jobs (kind, user_id, project_id, source_video_id, idempotency_key) "
        "select 'clip_generation', user_id, project_id, id, 'x' from source_videos",
        "select * from audit_log",
    ],
)
def test_user_cannot_tamper(sql):
    uid = make_user()
    make_video(uid, status="uploaded")
    u = As(uid)
    with pytest.raises(errors.InsufficientPrivilege):
        u.q(sql)
    u.close()


def test_user_can_rename_own_project_only():
    a, b = make_user(), make_user()
    make_video(a), make_video(b)
    ua = As(a)
    ua.q("update projects set title = 'Mon podcast'")
    with admin() as c:
        titles = dict(c.execute("select user_id, title from projects where user_id in (%s, %s)", (a, b)).fetchall())
    assert titles[a] == "Mon podcast" and titles[b] == "Nouveau projet"
    ua.close()


def test_worker_functions_not_callable_by_users():
    u = As(make_user())
    with pytest.raises(errors.InsufficientPrivilege):
        u.q("select claim_next_job('evil')")
    with pytest.raises(errors.InsufficientPrivilege):
        u.q("select requeue_stale_jobs()")
    u.close()


# ───────────────────────── Création de job et quotas ─────────────────────────


def test_cannot_use_someone_elses_video():
    a, b = make_user(), make_user()
    vid_b = make_video(b)
    ua = As(a)
    with pytest.raises(errors.NoDataFound):
        create_job(ua, vid_b)
    ua.close()


def test_video_must_be_validated():
    uid = make_user()
    u = As(uid)
    with pytest.raises(errors.ObjectNotInPrerequisiteState):
        create_job(u, make_video(uid, status="uploaded"))
    u.close()


def test_idempotency_same_key_same_job_single_reservation():
    uid = make_user()
    u = As(uid)
    vid = make_video(uid)
    j1 = create_job(u, vid, key="refresh-safe-key-1")
    j2 = create_job(u, vid, key="refresh-safe-key-1")
    assert j1 == j2
    assert quota(u)[0] == 1
    u.close()


def test_requested_clips_bounded_by_plan():
    uid = make_user()
    u = As(uid)
    vid = make_video(uid)
    for bad in (0, 6):
        with pytest.raises(errors.InvalidParameterValue):
            create_job(u, vid, clips=bad)
    u.close()


def test_free_video_length_limit():
    uid = make_user()
    u = As(uid)
    with pytest.raises(errors.ProgramLimitExceeded):
        create_job(u, make_video(uid, duration=15 * 60 + 1))
    u.close()


def test_free_concurrency_and_video_quota():
    uid = make_user()
    u = As(uid)
    j1 = create_job(u, make_video(uid))
    with pytest.raises(errors.ConfigurationLimitExceeded, match="too_many_active_jobs"):
        create_job(u, make_video(uid))
    set_status(j1[0], "completed", 3)
    j2 = create_job(u, make_video(uid))
    set_status(j2[0], "completed", 3)
    j3 = create_job(u, make_video(uid))
    set_status(j3[0], "completed", 3)
    with pytest.raises(errors.ConfigurationLimitExceeded, match="quota_videos_exceeded"):
        create_job(u, make_video(uid))
    assert quota(u)[:2] == (3, 3)
    u.close()


def test_minutes_quota():
    uid = make_user()  # Free : 30 min
    u = As(uid)
    j = create_job(u, make_video(uid, duration=14 * 60))
    set_status(j[0], "completed", 2)
    j = create_job(u, make_video(uid, duration=14 * 60))
    set_status(j[0], "completed", 2)
    with pytest.raises(errors.ConfigurationLimitExceeded, match="quota_minutes_exceeded"):
        create_job(u, make_video(uid, duration=3 * 60))
    u.close()


def test_parallel_requests_never_exceed_quota():
    """10 requêtes simultanées sur un quota de 4 vidéos → exactement 4 jobs."""
    uid = make_user(plan="race")
    vids = [make_video(uid, duration=60) for _ in range(10)]
    ok, refused = [], []
    barrier = threading.Barrier(10)

    def worker(v):
        u = As(uid)
        barrier.wait()
        try:
            ok.append(create_job(u, v))
        except errors.ConfigurationLimitExceeded:
            refused.append(v)
        finally:
            u.close()

    threads = [threading.Thread(target=worker, args=(v,)) for v in vids]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert len(ok) == 4 and len(refused) == 6
    u = As(uid)
    assert quota(u)[0] == 4
    u.close()


# ───────────────────────── Remboursements ─────────────────────────


def test_failed_job_without_clips_is_refunded_once():
    uid = make_user()
    u = As(uid)
    j = create_job(u, make_video(uid, duration=600))
    assert quota(u)[0] == 1 and quota(u)[2] == 600
    set_status(j[0], "failed")
    set_status(j[0], "queued")
    set_status(j[0], "failed")
    assert quota(u)[0] == 0 and quota(u)[2] == 0
    kinds = [r[0] for r in u.q("select kind from usage_records order by id")]
    assert kinds == ["reserve", "refund"]
    u.close()


def test_partial_failure_with_clips_is_not_refunded():
    uid = make_user()
    u = As(uid)
    j = create_job(u, make_video(uid))
    set_status(j[0], "failed", clips_produced=2)
    assert quota(u)[0] == 1
    u.close()


def test_user_cancel_queued_job_refunds():
    uid = make_user()
    u = As(uid)
    j = create_job(u, make_video(uid))
    res = u.q("select status from cancel_job(%s)", (j[0],))
    assert res == [("cancelled",)]
    assert quota(u)[0] == 0
    u.close()


def test_status_changes_are_logged():
    uid = make_user()
    u = As(uid)
    j = create_job(u, make_video(uid))
    set_status(j[0], "transcribing")
    set_status(j[0], "completed", 4)
    steps = [r[0] for r in u.q("select to_status from job_events where job_id = %s order by id", (j[0],))]
    assert steps == ["queued", "transcribing", "completed"]
    assert u.q("select finished_at is not null from processing_jobs where id = %s", (j[0],)) == [(True,)]
    u.close()


# ───────────────────────── File de traitement (worker) ─────────────────────────


def _drain_queue():
    with admin() as c:
        c.execute("update processing_jobs set status = 'cancelled' where status = 'queued'")


def test_two_workers_never_claim_same_job():
    _drain_queue()
    uid = make_user(plan="race")
    u = As(uid)
    jobs = {create_job(u, make_video(uid, duration=60))[0] for _ in range(3)}
    claimed: list = []
    lock = threading.Lock()

    def w(name):
        s = As(None, role="service_role")
        while True:
            row = s.q("select id from claim_next_job(%s)", (name,))[0][0]
            if row is None:
                break
            with lock:
                claimed.append(row)
        s.close()

    ts = [threading.Thread(target=w, args=(f"w{i}",)) for i in range(4)]
    [t.start() for t in ts]
    [t.join() for t in ts]
    assert sorted(claimed) == sorted(jobs)
    u.close()


def test_priority_order():
    _drain_queue()
    free_user, pro_user = make_user(), make_user(plan="pro")
    f = create_job(As(free_user), make_video(free_user))[0]
    p = create_job(As(pro_user), make_video(pro_user))[0]
    s = As(None, role="service_role")
    assert s.q("select id from claim_next_job('w')")[0][0] == p
    assert s.q("select id from claim_next_job('w')")[0][0] == f
    s.close()


def test_stale_job_requeued_then_failed_and_refunded():
    _drain_queue()
    uid = make_user()
    u = As(uid)
    j = create_job(u, make_video(uid))[0]
    s = As(None, role="service_role")
    with admin() as c:
        c.execute("update processing_jobs set max_attempts = 2 where id = %s", (j,))
    for attempt in (1, 2):
        assert s.q("select id from claim_next_job('w')")[0][0] == j
        with admin() as c:
            c.execute("update processing_jobs set heartbeat_at = now() - interval '10 minutes', "
                      "run_after = now() where id = %s", (j,))
        assert s.q("select requeue_stale_jobs()")[0][0] == 1
        with admin() as c:
            c.execute("update processing_jobs set run_after = now() where id = %s", (j,))
        status = u.q("select status from processing_jobs where id = %s", (j,))[0][0]
        assert status == ("queued" if attempt == 1 else "failed")
    assert quota(u)[0] == 0
    s.close(), u.close()


def test_heartbeat_reports_cancel_request():
    _drain_queue()
    uid = make_user()
    u = As(uid)
    j = create_job(u, make_video(uid))[0]
    s = As(None, role="service_role")
    s.q("select claim_next_job('w1')")
    assert s.q("select heartbeat_job(%s, 'w1')", (j,))[0][0] is False
    assert u.q("select status, cancel_requested from cancel_job(%s)", (j,)) == [("transcribing", True)]
    assert s.q("select heartbeat_job(%s, 'w1')", (j,))[0][0] is True
    with pytest.raises(errors.ObjectNotInPrerequisiteState):
        s.q("select heartbeat_job(%s, 'intruder')", (j,))
    s.close(), u.close()


# ───────────────────────── Import de vidéos ─────────────────────────


def upload(user: As, name="podcast épisode 12.mp4", size=100_000_000, rights=True):
    return user.q("select * from create_upload(%s, %s, %s)", (name, size, rights))[0]


def test_create_upload_generates_owned_key_and_project():
    uid = make_user()
    u = As(uid)
    vid, pid, key = upload(u)
    assert key == f"sources/{uid}/{vid}/source.mp4"
    assert u.q("select title from projects where id = %s", (pid,)) == [("podcast épisode 12",)]
    assert u.q("select status from source_videos where id = %s", (vid,)) == [("pending_upload",)]
    u.close()


@pytest.mark.parametrize(
    "kwargs,error",
    [
        ({"rights": False}, "rights_not_confirmed"),
        ({"name": "notes.pdf"}, "unsupported_extension"),
        ({"name": "sans-extension"}, "unsupported_extension"),
        ({"size": 3 * 1024**3}, "file_too_large"),  # Free : 2 Go maximum
        ({"size": 0}, "invalid_size"),
    ],
)
def test_create_upload_rejects_invalid_requests(kwargs, error):
    u = As(make_user())
    with pytest.raises(psycopg.Error, match=error):
        upload(u, **kwargs)
    u.close()


def test_create_upload_refused_when_monthly_quota_used():
    uid = make_user()
    u = As(uid)
    for _ in range(3):
        j = create_job(u, make_video(uid, duration=60))
        set_status(j[0], "completed", 2)
    with pytest.raises(errors.ConfigurationLimitExceeded, match="quota_videos_exceeded"):
        upload(u)
    u.close()


def test_at_most_three_pending_uploads():
    u = As(make_user())
    for _ in range(3):
        upload(u)
    with pytest.raises(errors.ConfigurationLimitExceeded, match="too_many_pending_uploads"):
        upload(u)
    u.close()


def test_storage_key_must_belong_to_owner():
    a, b = make_user(), make_user()
    with admin() as c, pytest.raises(errors.CheckViolation):
        pid = c.execute("insert into projects (user_id) values (%s) returning id", (b,)).fetchone()[0]
        c.execute(
            """insert into source_videos (project_id, user_id, storage_key, original_filename, declared_size_bytes,
               rights_confirmed_at) values (%s, %s, %s, 'x.mp4', 1, now())""",
            (pid, b, f"sources/{a}/stolen/source.mp4"),
        )


def test_complete_upload_enqueues_probe_once_and_only_for_owner():
    a, b = make_user(), make_user()
    ua, ub = As(a), As(b)
    vid, _, _ = upload(ua)
    with pytest.raises(errors.NoDataFound):
        ub.q("select complete_upload(%s)", (vid,))
    j1 = ua.q("select id, kind, status from complete_upload(%s)", (vid,))[0]
    j2 = ua.q("select id from complete_upload(%s)", (vid,))[0]
    assert j1[1:] == ("probe", "queued") and j1[0] == j2[0]
    assert ua.q("select status from source_videos where id = %s", (vid,)) == [("uploaded",)]
    ua.close(), ub.close()


def test_abort_upload_hides_video_and_project():
    uid = make_user()
    u = As(uid)
    vid, pid, _ = upload(u)
    u.q("select abort_upload(%s)", (vid,))
    assert u.q("select count(*) from source_videos where id = %s", (vid,)) == [(0,)]
    assert u.q("select count(*) from projects where id = %s", (pid,)) == [(0,)]
    u.close()


# ───────────────────────── Maintenance ─────────────────────────


def test_maintenance_closes_abandoned_uploads_and_expired_sources():
    uid = make_user()
    u = As(uid)
    old_vid, old_pid, _ = upload(u, name="abandonné.mp4")
    fresh_vid, fresh_pid, _ = upload(u, name="en cours.mp4")
    expired = make_video(uid, duration=60)
    busy = make_video(uid, duration=60)
    create_job(u, busy)  # traitement en cours : ne doit pas être purgé
    with admin() as c:
        c.execute("update source_videos set created_at = now() - interval '25 hours' where id = %s", (old_vid,))
        c.execute("update source_videos set purge_after = now() - interval '1 minute' where id in (%s, %s)",
                  (expired, busy))
        res = c.execute("select run_maintenance()").fetchone()[0]
    assert res["stale_uploads"] == 1 and res["expired_sources"] == 1
    visible = {r[0] for r in u.q("select id from source_videos")}
    assert old_vid not in visible and expired not in visible
    assert fresh_vid in visible and busy in visible
    assert u.q("select count(*) from projects where id = %s", (old_pid,)) == [(0,)]
    assert u.q("select count(*) from projects where id = %s", (fresh_pid,)) == [(1,)]
    with admin() as c:  # idempotent : un second passage ne change rien
        assert c.execute("select run_maintenance()").fetchone()[0]["stale_uploads"] == 0
    u.close()


def test_maintenance_not_callable_by_users():
    u = As(make_user())
    with pytest.raises(errors.InsufficientPrivilege):
        u.q("select run_maintenance()")
    u.close()


# ───────────────────────── Suppression de compte ─────────────────────────


def test_delete_my_account_erases_everything_and_only_mine():
    a, b = make_user(), make_user()
    ua, ub = As(a), As(b)
    upload(ua)
    j = create_job(ua, make_video(a, duration=60))
    set_status(j[0], "completed", 2)
    make_video(b)
    ua.q("select delete_my_account()")
    with admin() as c:
        for table in ("profiles", "subscriptions", "user_settings"):
            assert c.execute(f"select count(*) from {table} where {'id' if table == 'profiles' else 'user_id'} = %s",
                             (a,)).fetchone()[0] == 0, table
        for table in ("projects", "source_videos", "processing_jobs", "job_events", "usage_records", "clips"):
            assert c.execute(f"select count(*) from {table} where user_id = %s", (a,)).fetchone()[0] == 0, table
        assert c.execute("select count(*) from auth.users where id = %s", (a,)).fetchone()[0] == 0
        assert c.execute("select count(*) from source_videos where user_id = %s", (b,)).fetchone()[0] == 1
        assert c.execute("select count(*) from audit_log where action = 'account_deleted' and actor_id = %s",
                         (a,)).fetchone()[0] == 1
    ua.close(), ub.close()


def test_delete_account_requires_session():
    anon = As(None, role="anon")
    with pytest.raises(errors.InsufficientPrivilege):
        anon.q("select delete_my_account()")
    anon.close()


# ───────────────────────── Import par lien YouTube ─────────────────────────


@pytest.mark.parametrize(
    "url",
    [
        "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "https://youtube.com/watch?v=aqz-KE-bpKQ&t=42s",
        "https://www.youtube.com/watch?feature=share&v=aqz-KE-bpKQ",
        "https://youtu.be/aqz-KE-bpKQ?si=abc",
        "https://m.youtube.com/watch?v=aqz-KE-bpKQ",
        "https://www.youtube.com/shorts/aqz-KE-bpKQ",
        "youtube.com/live/aqz-KE-bpKQ",
        "  https://www.youtube.com/embed/aqz-KE-bpKQ  ",
        "https://www.youtube.com/watch?v=aqz-KE-bpKQ;rm -rf /",  # le reste est ignoré : seul l'identifiant est gardé
    ],
)
def test_url_import_accepts_youtube_forms_and_normalises(url):
    uid = make_user()
    u = As(uid)
    vid, pid = u.q("select * from create_url_import(%s, true)", (url,))[0]
    with admin() as c:
        sv = c.execute("select status, source_url, storage_key from source_videos where id = %s", (vid,)).fetchone()
        job = c.execute("select kind, status, options, project_id from processing_jobs where source_video_id = %s",
                        (vid,)).fetchall()
    assert sv == ("importing", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", f"sources/{uid}/{vid}/source.mp4")
    assert job == [("import_url", "queued", {"url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ"}, pid)]


@pytest.mark.parametrize(
    "url,rights,error",
    [
        ("https://www.youtube.com/watch?v=aqz-KE-bpKQ", False, "rights_not_confirmed"),
        ("https://vimeo.com/123456", True, "invalid_url"),
        ("https://evil.com/youtube.com/watch?v=aqz-KE-bpKQ", True, "invalid_url"),
        ("https://www.youtube.com/watch?v=short", True, "invalid_url"),
        ("https://www.youtube.com/playlist?list=PL123", True, "invalid_url"),
        ("file:///etc/passwd", True, "invalid_url"),
    ],
)
def test_url_import_rejects_bad_requests(url, rights, error):
    u = As(make_user())
    with pytest.raises(psycopg.Error, match=error):
        u.q("select * from create_url_import(%s, %s)", (url, rights))
    assert u.q("select count(*) from processing_jobs")[0][0] == 0


def test_url_import_requires_session_and_counts_as_pending():
    with pytest.raises(errors.InsufficientPrivilege):
        As(None, role="anon").q("select * from create_url_import('https://youtu.be/aqz-KE-bpKQ', true)")
    u = As(make_user())
    for _ in range(3):
        u.q("select * from create_url_import('https://youtu.be/aqz-KE-bpKQ', true)")
    with pytest.raises(psycopg.Error, match="too_many_pending_uploads"):
        u.q("select * from create_url_import('https://youtu.be/aqz-KE-bpKQ', true)")


def test_url_import_refused_when_monthly_quota_used():
    uid = make_user()
    u = As(uid)
    for _ in range(3):  # offre Free : 3 vidéos / mois (un seul traitement à la fois)
        set_status(create_job(u, make_video(uid, duration=60), clips=1)[0], "completed", 1)
    with pytest.raises(psycopg.Error, match="quota_videos_exceeded"):
        u.q("select * from create_url_import('https://youtu.be/aqz-KE-bpKQ', true)")


def test_import_job_claimed_as_uploading_and_failure_rejects_video():
    uid = make_user()
    vid, _ = As(uid).q("select * from create_url_import('https://youtu.be/aqz-KE-bpKQ', true)")[0]
    with admin() as c:
        c.execute("update processing_jobs set priority = 1000 where source_video_id = %s", (vid,))
        job = c.execute("select id, status, kind from claim_next_job('w1', array['import_url']::job_kind[])").fetchone()
        assert job[1:] == ("uploading", "import_url")
        c.execute("update processing_jobs set status = 'failed', error_message = 'Vidéo privée.' where id = %s",
                  (job[0],))
        sv = c.execute("select status, rejection_reason from source_videos where id = %s", (vid,)).fetchone()
    assert sv == ("rejected", "Vidéo privée.")
