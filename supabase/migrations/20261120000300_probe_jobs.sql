-- Vérification technique d'une vidéo après upload (ffprobe, côté worker).
-- Appelée par le serveur web (rôle service) une fois l'upload multipart terminé.
-- Idempotente : un seul job de vérification par vidéo.
create function public.enqueue_probe_job(p_source_video_id uuid)
returns public.processing_jobs
language plpgsql security definer set search_path = public as $$
declare v public.source_videos; j public.processing_jobs;
begin
  select * into v from public.source_videos where id = p_source_video_id for update;
  if not found then raise exception 'source_video_not_found' using errcode = 'P0002'; end if;
  if v.status = 'pending_upload' then
    update public.source_videos set status = 'uploaded' where id = v.id;
  elsif v.status not in ('uploaded') then
    raise exception 'source_video_not_awaiting_probe' using errcode = '55000';
  end if;

  insert into public.processing_jobs
    (kind, user_id, project_id, source_video_id, priority, idempotency_key, max_attempts)
  values ('probe', v.user_id, v.project_id, v.id, 100, 'probe:' || v.id::text, 3)
  on conflict (user_id, idempotency_key) do nothing;

  select * into j from public.processing_jobs
   where user_id = v.user_id and idempotency_key = 'probe:' || v.id::text;
  return j;
end $$;

revoke all on function public.enqueue_probe_job(uuid) from public, anon, authenticated;
grant execute on function public.enqueue_probe_job(uuid) to service_role;
