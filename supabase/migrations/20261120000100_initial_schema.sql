-- CLIPERA — schéma initial
-- Tables métier, file de traitements Postgres, quotas atomiques, traçabilité, RLS.
-- Convention : toute écriture sensible passe par une fonction SECURITY DEFINER
-- qui revérifie auth.uid(), ou par le rôle service (worker / webhooks).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Types
-- ─────────────────────────────────────────────────────────────
create type public.job_status as enum (
  'queued', 'uploading', 'transcribing', 'analyzing', 'selecting',
  'rendering', 'completed', 'failed', 'cancelled'
);
create type public.job_kind as enum ('probe', 'clip_generation');
create type public.source_video_status as enum (
  'pending_upload', 'uploaded', 'validated', 'rejected', 'deleted'
);
create type public.clip_status as enum ('ready', 'rendering', 'failed', 'deleted');
create type public.subscription_status as enum (
  'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid'
);
create type public.usage_kind as enum ('reserve', 'refund', 'adjust');

-- ─────────────────────────────────────────────────────────────
-- Offres (configurables sans modifier le code)
-- ─────────────────────────────────────────────────────────────
create table public.plans (
  id                        text primary key check (id ~ '^[a-z_]+$'),
  name                      text not null,
  price_cents               integer not null check (price_cents >= 0),
  currency                  text not null default 'eur',
  monthly_source_videos     integer not null check (monthly_source_videos >= 0),
  monthly_source_seconds    integer not null check (monthly_source_seconds >= 0),
  max_clips_per_video       integer not null check (max_clips_per_video between 1 and 20),
  max_video_seconds         integer not null check (max_video_seconds > 0),
  max_upload_bytes          bigint  not null check (max_upload_bytes > 0),
  export_max_height         integer not null check (export_max_height in (720, 1080, 1440, 2160)),
  watermark                 boolean not null default false,
  priority                  smallint not null default 0,
  max_concurrent_jobs       smallint not null default 1 check (max_concurrent_jobs >= 1),
  features                  jsonb not null default '{}'::jsonb,
  stripe_price_id           text unique,
  is_public                 boolean not null default true,
  sort_order                smallint not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Utilisateurs
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) <= 80),
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.user_settings (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  default_style    text not null default 'natural' check (default_style in ('natural', 'dynamic', 'minimal')),
  default_format   text not null default '9:16' check (default_format in ('9:16', '1:1', '16:9')),
  caption_defaults jsonb not null default '{"enabled": true, "style": "classic"}'::jsonb,
  locale           text not null default 'fr',
  updated_at       timestamptz not null default now()
);

create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references auth.users (id) on delete cascade,
  plan_id                 text not null references public.plans (id),
  status                  public.subscription_status not null default 'active',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (current_period_end is null or current_period_end > current_period_start)
);

-- ─────────────────────────────────────────────────────────────
-- Projets, vidéos sources, traitements, clips
-- ─────────────────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'Nouveau projet' check (char_length(title) between 1 and 120),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index projects_user_created_idx on public.projects (user_id, created_at desc) where deleted_at is null;

create table public.source_videos (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references public.projects (id) on delete cascade,
  user_id              uuid not null references auth.users (id) on delete cascade,
  status               public.source_video_status not null default 'pending_upload',
  storage_key          text not null unique,
  original_filename    text not null check (char_length(original_filename) <= 255),
  declared_size_bytes  bigint not null check (declared_size_bytes > 0),
  size_bytes           bigint,
  duration_seconds     numeric(10, 3),
  width                integer,
  height               integer,
  fps                  numeric(7, 3),
  video_codec          text,
  audio_codec          text,
  has_audio            boolean,
  probe                jsonb,
  rejection_reason     text,
  rights_confirmed_at  timestamptz not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  purge_after          timestamptz
);
create index source_videos_project_idx on public.source_videos (project_id);
create index source_videos_user_idx on public.source_videos (user_id, created_at desc);

create table public.processing_jobs (
  id                 uuid primary key default gen_random_uuid(),
  kind               public.job_kind not null,
  user_id            uuid not null references auth.users (id) on delete cascade,
  project_id         uuid not null references public.projects (id) on delete cascade,
  source_video_id    uuid not null references public.source_videos (id) on delete cascade,
  status             public.job_status not null default 'queued',
  status_detail      text,
  options            jsonb not null default '{}'::jsonb,
  requested_clips    smallint check (requested_clips between 1 and 20),
  priority           smallint not null default 0,
  idempotency_key    text not null,
  attempts           smallint not null default 0,
  max_attempts       smallint not null default 3,
  run_after          timestamptz not null default now(),
  locked_by          text,
  locked_at          timestamptz,
  heartbeat_at       timestamptz,
  cancel_requested   boolean not null default false,
  created_at         timestamptz not null default now(),
  started_at         timestamptz,
  finished_at        timestamptz,
  error_code         text,
  error_message      text,
  clips_produced     smallint not null default 0,
  metrics            jsonb not null default '{}'::jsonb,
  cost_estimate_usd  numeric(10, 5),
  unique (user_id, idempotency_key)
);
-- La file : on ne regarde que les jobs en attente.
create index processing_jobs_queue_idx on public.processing_jobs (priority desc, created_at)
  where status = 'queued';
create index processing_jobs_running_idx on public.processing_jobs (heartbeat_at)
  where status in ('transcribing', 'analyzing', 'selecting', 'rendering', 'uploading');
create index processing_jobs_user_idx on public.processing_jobs (user_id, created_at desc);
create index processing_jobs_project_idx on public.processing_jobs (project_id);

create table public.job_events (
  id          bigint generated always as identity primary key,
  job_id      uuid not null references public.processing_jobs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  at          timestamptz not null default now(),
  from_status public.job_status,
  to_status   public.job_status,
  message     text,
  data        jsonb
);
create index job_events_job_idx on public.job_events (job_id, at);

create table public.clips (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  project_id         uuid not null references public.projects (id) on delete cascade,
  job_id             uuid not null references public.processing_jobs (id) on delete cascade,
  source_video_id    uuid not null references public.source_videos (id) on delete cascade,
  status             public.clip_status not null default 'ready',
  rank               smallint not null check (rank >= 1),
  start_seconds      numeric(10, 3) not null check (start_seconds >= 0),
  end_seconds        numeric(10, 3) not null,
  title              text,
  transcript_excerpt text,
  score_total        smallint check (score_total between 0 and 100),
  score_details      jsonb,
  render_options     jsonb not null default '{}'::jsonb,
  storage_key        text unique,
  thumbnail_key      text unique,
  width              integer,
  height             integer,
  size_bytes         bigint,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (end_seconds > start_seconds),
  unique (job_id, rank)
);
create index clips_user_created_idx on public.clips (user_id, created_at desc) where status <> 'deleted';
create index clips_project_idx on public.clips (project_id);

-- Registre de consommation : quota utilisé = somme des lignes de la période.
create table public.usage_records (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  job_id           uuid references public.processing_jobs (id) on delete set null,
  kind             public.usage_kind not null,
  period_start     timestamptz not null,
  source_videos    integer not null,
  source_seconds   integer not null,
  note             text,
  created_at       timestamptz not null default now()
);
create index usage_records_user_period_idx on public.usage_records (user_id, period_start);
-- Une seule réservation et un seul remboursement par job (idempotence).
create unique index usage_records_one_reserve_per_job on public.usage_records (job_id) where kind = 'reserve';
create unique index usage_records_one_refund_per_job on public.usage_records (job_id) where kind = 'refund';

-- Journal des actions sensibles (suppression, changement d'offre, accès admin…)
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,
  target     text,
  data       jsonb,
  at         timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- updated_at automatique
-- ─────────────────────────────────────────────────────────────
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at := now(); return new; end $$;

create trigger plans_touch before update on public.plans for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger user_settings_touch before update on public.user_settings for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger source_videos_touch before update on public.source_videos for each row execute function public.touch_updated_at();
create trigger clips_touch before update on public.clips for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Création automatique du profil + offre Free à l'inscription
-- ─────────────────────────────────────────────────────────────
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  insert into public.subscriptions (user_id, plan_id, status) values (new.id, 'free', 'active')
    on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Période de facturation courante et offre effective
-- Offre payante active → période Stripe ; sinon → mois calendaire UTC sur l'offre Free.
-- ─────────────────────────────────────────────────────────────
create function public.effective_plan(p_user uuid,
  out plan_id text, out period_start timestamptz, out period_end timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare s public.subscriptions;
begin
  select * into s from public.subscriptions where user_id = p_user;
  if found and s.status in ('active', 'trialing') and s.plan_id <> 'free'
     and s.current_period_start is not null and s.current_period_end > now() then
    plan_id := s.plan_id; period_start := s.current_period_start; period_end := s.current_period_end;
  else
    plan_id := 'free';
    period_start := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
    period_end := period_start + interval '1 month';
  end if;
end $$;

-- Quota de l'utilisateur connecté (affiché dans le dashboard)
create function public.my_quota()
returns table (plan_id text, period_start timestamptz, period_end timestamptz,
               videos_used integer, videos_limit integer,
               seconds_used integer, seconds_limit integer)
language plpgsql stable security definer set search_path = public as $$
declare ep record; pl public.plans; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into ep from public.effective_plan(uid);
  select * into pl from public.plans p where p.id = ep.plan_id;
  return query
    select ep.plan_id, ep.period_start, ep.period_end,
           coalesce(sum(u.source_videos), 0)::int, pl.monthly_source_videos,
           coalesce(sum(u.source_seconds), 0)::int, pl.monthly_source_seconds
    from public.usage_records u
    where u.user_id = uid and u.period_start = ep.period_start;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Journalisation des changements de statut + remboursement automatique
-- Règle : un job de génération qui se termine en échec ou annulé SANS aucun clip
-- livré est intégralement remboursé (une seule fois).
-- ─────────────────────────────────────────────────────────────
create function public.on_job_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare r public.usage_records;
begin
  if tg_op = 'INSERT' then
    insert into public.job_events (job_id, user_id, to_status, message)
      values (new.id, new.user_id, new.status, 'created');
    return new;
  end if;
  if new.status is distinct from old.status then
    insert into public.job_events (job_id, user_id, from_status, to_status, message)
      values (new.id, new.user_id, old.status, new.status, new.status_detail);
    if new.status in ('completed', 'failed', 'cancelled') and new.finished_at is null then
      new.finished_at := now();
    end if;
    if new.kind = 'clip_generation' and new.status in ('failed', 'cancelled') and new.clips_produced = 0 then
      select * into r from public.usage_records where job_id = new.id and kind = 'reserve';
      if found then
        insert into public.usage_records (user_id, job_id, kind, period_start, source_videos, source_seconds, note)
          values (r.user_id, new.id, 'refund', r.period_start, -r.source_videos, -r.source_seconds,
                  'auto refund: ' || new.status::text || coalesce(' / ' || new.error_code, ''))
          on conflict do nothing;
      end if;
    end if;
  end if;
  return new;
end $$;

create trigger processing_jobs_status_insert after insert on public.processing_jobs
  for each row execute function public.on_job_status_change();
create trigger processing_jobs_status_update before update on public.processing_jobs
  for each row execute function public.on_job_status_change();

-- ─────────────────────────────────────────────────────────────
-- API utilisateur (appelées avec la session de l'utilisateur)
-- ─────────────────────────────────────────────────────────────

-- Lance la génération de clips : vérifie les droits, réserve le quota et crée le job
-- dans UNE transaction. Idempotent : même clé → même job, aucune double réservation.
create function public.create_clip_job(
  p_source_video_id uuid, p_requested_clips integer, p_options jsonb, p_idempotency_key text)
returns public.processing_jobs
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v public.source_videos; pl public.plans; ep record; j public.processing_jobs;
  used_videos int; used_seconds int; secs int; active int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) not between 8 and 100 then
    raise exception 'invalid_idempotency_key' using errcode = '22023';
  end if;

  -- Verrou par utilisateur : sérialise les réservations concurrentes du même compte.
  perform pg_advisory_xact_lock(hashtextextended('quota:' || uid::text, 0));

  select * into j from public.processing_jobs where user_id = uid and idempotency_key = p_idempotency_key;
  if found then return j; end if;

  select * into v from public.source_videos where id = p_source_video_id and user_id = uid;
  if not found then raise exception 'source_video_not_found' using errcode = 'P0002'; end if;
  if v.status <> 'validated' then raise exception 'source_video_not_ready' using errcode = '55000'; end if;

  select * into ep from public.effective_plan(uid);
  select * into pl from public.plans where id = ep.plan_id;

  if p_requested_clips is null or p_requested_clips < 1 or p_requested_clips > pl.max_clips_per_video then
    raise exception 'requested_clips_out_of_range' using errcode = '22023';
  end if;
  secs := ceil(v.duration_seconds)::int;
  if secs > pl.max_video_seconds then raise exception 'video_too_long_for_plan' using errcode = '54000'; end if;

  select count(*) into active from public.processing_jobs
    where user_id = uid and kind = 'clip_generation'
      and status not in ('completed', 'failed', 'cancelled');
  if active >= pl.max_concurrent_jobs then raise exception 'too_many_active_jobs' using errcode = '53400'; end if;

  select coalesce(sum(source_videos), 0), coalesce(sum(source_seconds), 0)
    into used_videos, used_seconds
    from public.usage_records where user_id = uid and period_start = ep.period_start;
  if used_videos + 1 > pl.monthly_source_videos then
    raise exception 'quota_videos_exceeded' using errcode = '53400';
  end if;
  if used_seconds + secs > pl.monthly_source_seconds then
    raise exception 'quota_minutes_exceeded' using errcode = '53400';
  end if;

  insert into public.processing_jobs
    (kind, user_id, project_id, source_video_id, options, requested_clips, priority, idempotency_key, max_attempts)
  values
    ('clip_generation', uid, v.project_id, v.id,
     coalesce(p_options, '{}'::jsonb)
       || jsonb_build_object('plan_id', pl.id, 'export_max_height', pl.export_max_height, 'watermark', pl.watermark),
     p_requested_clips, pl.priority, p_idempotency_key, 3)
  returning * into j;

  insert into public.usage_records (user_id, job_id, kind, period_start, source_videos, source_seconds, note)
    values (uid, j.id, 'reserve', ep.period_start, 1, secs, 'plan ' || pl.id);
  return j;
end $$;

-- Annulation par l'utilisateur : immédiate si en file, sinon demandée au worker.
create function public.cancel_job(p_job_id uuid) returns public.processing_jobs
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); j public.processing_jobs;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into j from public.processing_jobs where id = p_job_id and user_id = uid for update;
  if not found then raise exception 'job_not_found' using errcode = 'P0002'; end if;
  if j.status = 'queued' then
    update public.processing_jobs set status = 'cancelled', status_detail = 'cancelled by user'
      where id = j.id returning * into j;
  elsif j.status not in ('completed', 'failed', 'cancelled') then
    update public.processing_jobs set cancel_requested = true where id = j.id returning * into j;
  end if;
  return j;
end $$;

-- ─────────────────────────────────────────────────────────────
-- API worker (rôle service uniquement)
-- ─────────────────────────────────────────────────────────────

-- Réserve le prochain job. SKIP LOCKED : plusieurs workers ne prennent jamais le même job.
create function public.claim_next_job(p_worker_id text, p_kinds public.job_kind[] default null)
returns public.processing_jobs
language plpgsql security definer set search_path = public as $$
declare j public.processing_jobs;
begin
  update public.processing_jobs pj
     set status = case when pj.kind = 'probe' then 'analyzing'::public.job_status else 'transcribing'::public.job_status end,
         status_detail = 'claimed',
         locked_by = p_worker_id, locked_at = now(), heartbeat_at = now(),
         started_at = coalesce(pj.started_at, now()), attempts = pj.attempts + 1
   where pj.id = (
     select id from public.processing_jobs
      where status = 'queued' and run_after <= now() and not cancel_requested
        and (p_kinds is null or kind = any (p_kinds))
      order by priority desc, created_at
      for update skip locked
      limit 1)
  returning pj.* into j;
  return j;  -- NULL si la file est vide
end $$;

-- Battement de cœur : prouve que le worker travaille encore et renvoie l'éventuelle demande d'annulation.
create function public.heartbeat_job(p_job_id uuid, p_worker_id text) returns boolean
language plpgsql security definer set search_path = public as $$
declare cancel boolean;
begin
  update public.processing_jobs set heartbeat_at = now()
   where id = p_job_id and locked_by = p_worker_id
  returning cancel_requested into cancel;
  if not found then raise exception 'job_not_owned' using errcode = '55000'; end if;
  return cancel;
end $$;

-- Remet en file (ou passe en échec) les jobs dont le worker ne donne plus signe de vie.
create function public.requeue_stale_jobs(p_timeout interval default interval '5 minutes')
returns integer
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with stale as (
    select id from public.processing_jobs
     where status in ('uploading', 'transcribing', 'analyzing', 'selecting', 'rendering')
       and heartbeat_at < now() - p_timeout
     for update skip locked)
  update public.processing_jobs pj
     set status = case when pj.attempts >= pj.max_attempts then 'failed'::public.job_status else 'queued'::public.job_status end,
         status_detail = 'worker heartbeat lost',
         error_code = case when pj.attempts >= pj.max_attempts then 'worker_lost' else pj.error_code end,
         locked_by = null, locked_at = null,
         run_after = now() + make_interval(secs => 30 * pj.attempts)
    from stale where pj.id = stale.id;
  get diagnostics n = row_count;
  return n;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Permissions et Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.plans            enable row level security;
alter table public.profiles         enable row level security;
alter table public.user_settings    enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.projects         enable row level security;
alter table public.source_videos    enable row level security;
alter table public.processing_jobs  enable row level security;
alter table public.job_events       enable row level security;
alter table public.clips            enable row level security;
alter table public.usage_records    enable row level security;
alter table public.audit_log        enable row level security;

-- Par défaut : aucun droit. On accorde ensuite le strict nécessaire.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant select on public.plans to anon, authenticated;
create policy plans_public_read on public.plans for select using (is_public);

grant select, update (display_name) on public.profiles to authenticated;
create policy profiles_own_read on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

grant select, update (default_style, default_format, caption_defaults, locale) on public.user_settings to authenticated;
create policy settings_own_read on public.user_settings for select to authenticated using (user_id = auth.uid());
create policy settings_own_update on public.user_settings for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select on public.subscriptions to authenticated;
create policy subs_own_read on public.subscriptions for select to authenticated using (user_id = auth.uid());

grant select, update (title) on public.projects to authenticated;
create policy projects_own_read on public.projects for select to authenticated
  using (user_id = auth.uid() and deleted_at is null);
create policy projects_own_update on public.projects for update to authenticated
  using (user_id = auth.uid() and deleted_at is null) with check (user_id = auth.uid());

grant select on public.source_videos, public.processing_jobs, public.job_events,
               public.clips, public.usage_records to authenticated;
create policy sv_own_read on public.source_videos for select to authenticated
  using (user_id = auth.uid() and status <> 'deleted');
create policy jobs_own_read on public.processing_jobs for select to authenticated using (user_id = auth.uid());
create policy events_own_read on public.job_events for select to authenticated using (user_id = auth.uid());
create policy clips_own_read on public.clips for select to authenticated
  using (user_id = auth.uid() and status <> 'deleted');
create policy usage_own_read on public.usage_records for select to authenticated using (user_id = auth.uid());
-- audit_log : aucune policy → invisible pour les utilisateurs.

grant execute on function public.my_quota() to authenticated;
grant execute on function public.create_clip_job(uuid, integer, jsonb, text) to authenticated;
grant execute on function public.cancel_job(uuid) to authenticated;
grant execute on function public.claim_next_job(text, public.job_kind[]) to service_role;
grant execute on function public.heartbeat_job(uuid, text) to service_role;
grant execute on function public.requeue_stale_jobs(interval) to service_role;
grant execute on function public.effective_plan(uuid) to service_role;

-- Progression en direct (Supabase Realtime respecte la RLS ci-dessus).
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.processing_jobs, public.clips;
  end if;
end $$;
