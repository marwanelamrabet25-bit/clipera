-- Import de vidéos : préparation et finalisation de l'envoi, appelées avec la session de l'utilisateur.
-- La clé de stockage est TOUJOURS générée ici (jamais fournie par le navigateur) et commence par
-- sources/<user_id>/ : impossible de faire traiter le fichier d'un autre utilisateur.

alter table public.source_videos
  add constraint source_videos_key_owner_prefix
  check (storage_key like 'sources/' || user_id::text || '/%');

create function public.create_upload(
  p_filename text, p_size_bytes bigint, p_rights_confirmed boolean)
returns table (source_video_id uuid, project_id uuid, storage_key text)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  ext text;
  ep record;
  pl public.plans;
  used_videos int;
  pending int;
  v_id uuid := gen_random_uuid();
  p_id uuid;
  title text;
  k text;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_rights_confirmed is not true then raise exception 'rights_not_confirmed' using errcode = '22023'; end if;
  if p_filename is null or char_length(p_filename) not between 1 and 255 then
    raise exception 'invalid_filename' using errcode = '22023';
  end if;
  ext := lower(substring(p_filename from '\.([A-Za-z0-9]{2,4})$'));
  if ext is null or ext not in ('mp4', 'mov', 'm4v', 'mkv', 'webm') then
    raise exception 'unsupported_extension' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('quota:' || uid::text, 0));
  select * into ep from public.effective_plan(uid);
  select * into pl from public.plans where id = ep.plan_id;

  if p_size_bytes is null or p_size_bytes <= 0 then raise exception 'invalid_size' using errcode = '22023'; end if;
  if p_size_bytes > pl.max_upload_bytes then raise exception 'file_too_large' using errcode = '54000'; end if;

  -- Inutile d'envoyer (et de stocker) une vidéo qui ne pourra pas être traitée ce mois-ci.
  select coalesce(sum(source_videos), 0) into used_videos
    from public.usage_records where user_id = uid and period_start = ep.period_start;
  if used_videos >= pl.monthly_source_videos then
    raise exception 'quota_videos_exceeded' using errcode = '53400';
  end if;

  -- Anti-abus : pas plus de 3 envois inachevés en même temps (sur 24 h).
  select count(*) into pending from public.source_videos
    where user_id = uid and status = 'pending_upload' and created_at > now() - interval '1 day';
  if pending >= 3 then raise exception 'too_many_pending_uploads' using errcode = '53400'; end if;

  title := left(nullif(trim(regexp_replace(p_filename, '\.[^.]*$', '')), ''), 120);
  insert into public.projects (user_id, title) values (uid, coalesce(title, 'Nouveau projet')) returning id into p_id;

  k := 'sources/' || uid::text || '/' || v_id::text || '/source.' || ext;
  insert into public.source_videos
    (id, project_id, user_id, status, storage_key, original_filename, declared_size_bytes, rights_confirmed_at,
     purge_after)
  values (v_id, p_id, uid, 'pending_upload', k, p_filename, p_size_bytes, now(), now() + interval '30 days');

  return query select v_id, p_id, k;
end $$;

-- Finalisation : le serveur web a vérifié que le fichier est bien présent dans le stockage.
-- Lance la vérification technique par le worker (idempotent).
create function public.complete_upload(p_source_video_id uuid)
returns public.processing_jobs
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); v public.source_videos;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into v from public.source_videos where id = p_source_video_id and user_id = uid;
  if not found then raise exception 'source_video_not_found' using errcode = 'P0002'; end if;
  return public.enqueue_probe_job(v.id);
end $$;

-- Abandon d'un envoi (annulation par l'utilisateur ou échec définitif).
create function public.abort_upload(p_source_video_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  update public.source_videos set status = 'deleted'
   where id = p_source_video_id and user_id = uid and status = 'pending_upload';
  update public.projects p set deleted_at = now()
    from public.source_videos sv
   where sv.id = p_source_video_id and sv.project_id = p.id and p.user_id = uid and sv.status = 'deleted';
end $$;

revoke all on function public.create_upload(text, bigint, boolean) from public, anon;
revoke all on function public.complete_upload(uuid) from public, anon;
revoke all on function public.abort_upload(uuid) from public, anon;
grant execute on function public.create_upload(text, bigint, boolean) to authenticated;
grant execute on function public.complete_upload(uuid) to authenticated;
grant execute on function public.abort_upload(uuid) to authenticated;
