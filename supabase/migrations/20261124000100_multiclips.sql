-- Génération multi-clips (jusqu'à 10 clips par vidéo) — migration NON destructive.
--
-- 1. Limite de clips par vidéo : 10 pour les offres payantes, 5 pour Free (inchangé).
--    Aucun prix, aucun quota de vidéos ou de minutes n'est modifié : le quota se compte en vidéos et en minutes
--    importées, jamais en clips. Générer 10 clips au lieu de 5 ne coûte donc rien de plus à l'utilisateur.
update public.plans set max_clips_per_video = 10 where id in ('starter', 'pro', 'ultimate') and max_clips_per_video < 10;

-- 2. Suppression d'un clip par son propriétaire (le site efface d'abord les fichiers du stockage).
--    L'archive ZIP de la génération ne contiendrait plus la bonne liste : on la retire des informations du job
--    (le site supprime aussi le fichier).
create function public.delete_my_clip(p_clip_id uuid)
returns table (job_id uuid, zip_key text)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); c public.clips; z text;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into c from public.clips where id = p_clip_id and user_id = uid and status in ('ready', 'failed') for update;
  if not found then raise exception 'clip_not_found' using errcode = 'P0002'; end if;
  update public.clips set status = 'deleted' where id = c.id;
  select j.metrics ->> 'zip_key' into z from public.processing_jobs j where j.id = c.job_id;
  update public.processing_jobs set metrics = metrics - 'zip_key' where id = c.job_id and metrics ? 'zip_key';
  insert into public.audit_log (actor_id, action, target) values (uid, 'clip_deleted', c.id::text);
  return query select c.job_id, z;
end $$;

revoke all on function public.delete_my_clip(uuid) from public, anon;
grant execute on function public.delete_my_clip(uuid) to authenticated;
