-- Import d'une vidéo par lien YouTube.
-- Le lien est validé et normalisé ICI (jamais d'URL libre transmise au worker) ; le worker télécharge la vidéo,
-- la dépose dans le stockage puis lance la vérification habituelle (probe).
-- Mêmes garde-fous que l'import de fichier : droits confirmés, quota restant, anti-abus.

alter type public.job_kind add value if not exists 'import_url';
alter type public.source_video_status add value if not exists 'importing';

alter table public.source_videos
  add column source_url text check (source_url is null or source_url ~ '^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}$');

-- Identifiant de vidéo YouTube (11 caractères) extrait des formes de liens courantes, sinon NULL.
create function public.youtube_video_id(p_url text) returns text
language sql immutable set search_path = '' as $$
  select case
    when p_url ~* '^\s*(https?://)?((www|m|music)\.)?(youtube\.com|youtu\.be)/' then
      substring(trim(p_url) from
        '(?:youtube\.com/(?:watch\?(?:[^#]*&)?v=|shorts/|live/|embed/|v/)|youtu\.be/)([A-Za-z0-9_-]{11})(?:[^A-Za-z0-9_-]|$)')
  end
$$;

create function public.create_url_import(p_url text, p_rights_confirmed boolean)
returns table (source_video_id uuid, project_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  yt text;
  ep record;
  pl public.plans;
  used_videos int;
  pending int;
  v_id uuid := gen_random_uuid();
  p_id uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_rights_confirmed is not true then raise exception 'rights_not_confirmed' using errcode = '22023'; end if;
  if p_url is null or char_length(p_url) > 500 then raise exception 'invalid_url' using errcode = '22023'; end if;
  yt := public.youtube_video_id(p_url);
  if yt is null then raise exception 'invalid_url' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended('quota:' || uid::text, 0));
  select * into ep from public.effective_plan(uid);
  select * into pl from public.plans where id = ep.plan_id;

  select coalesce(sum(source_videos), 0) into used_videos
    from public.usage_records where user_id = uid and period_start = ep.period_start;
  if used_videos >= pl.monthly_source_videos then
    raise exception 'quota_videos_exceeded' using errcode = '53400';
  end if;

  -- Anti-abus : pas plus de 3 imports (fichier ou lien) inachevés en même temps.
  select count(*) into pending from public.source_videos
    where user_id = uid and status in ('pending_upload', 'importing') and created_at > now() - interval '1 day';
  if pending >= 3 then raise exception 'too_many_pending_uploads' using errcode = '53400'; end if;

  insert into public.projects (user_id, title) values (uid, 'Vidéo YouTube') returning id into p_id;
  insert into public.source_videos
    (id, project_id, user_id, status, storage_key, original_filename, declared_size_bytes, rights_confirmed_at,
     purge_after, source_url)
  values (v_id, p_id, uid, 'importing', 'sources/' || uid::text || '/' || v_id::text || '/source.mp4',
          'youtube-' || yt || '.mp4', 1, now(), now() + interval '30 days',
          'https://www.youtube.com/watch?v=' || yt);

  insert into public.processing_jobs
    (kind, user_id, project_id, source_video_id, options, priority, idempotency_key, max_attempts)
  values ('import_url', uid, p_id, v_id, jsonb_build_object('url', 'https://www.youtube.com/watch?v=' || yt),
          100, 'import:' || v_id::text, 2);

  return query select v_id, p_id;
end $$;

revoke all on function public.create_url_import(text, boolean) from public, anon;
grant execute on function public.create_url_import(text, boolean) to authenticated;

-- Le statut affiché au démarrage dépend du type de job (import → « uploading »).
create or replace function public.claim_next_job(p_worker_id text, p_kinds public.job_kind[] default null)
returns public.processing_jobs
language plpgsql security definer set search_path = public as $$
declare j public.processing_jobs;
begin
  update public.processing_jobs pj
     set status = case pj.kind
                    when 'probe' then 'analyzing'::public.job_status
                    when 'import_url' then 'uploading'::public.job_status
                    else 'transcribing'::public.job_status end,
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
  return j;
end $$;

-- Un import qui échoue définitivement (y compris worker perdu) rend la vidéo « refusée » avec une raison.
create function public.on_import_job_failed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'import_url' and new.status in ('failed', 'cancelled') and old.status is distinct from new.status then
    update public.source_videos
       set status = 'rejected',
           rejection_reason = coalesce(new.error_message, 'L''import de la vidéo a échoué.')
     where id = new.source_video_id and status = 'importing';
  end if;
  return new;
end $$;

create trigger processing_jobs_import_failed after update on public.processing_jobs
  for each row execute function public.on_import_job_failed();
