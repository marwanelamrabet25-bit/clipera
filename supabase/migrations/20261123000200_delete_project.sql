-- Suppression d'un projet par son propriétaire (vidéo source + clips). Les fichiers sont effacés du stockage
-- AVANT l'appel (par le serveur web) ; ici on masque définitivement les lignes. Le quota déjà consommé n'est pas
-- rendu (sinon : supprimer puis recommencer à l'infini). Refusé tant qu'un traitement est en cours.
create function public.delete_my_project(p_project_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.projects where id = p_project_id and user_id = uid and deleted_at is null) then
    raise exception 'project_not_found';
  end if;
  if exists (select 1 from public.processing_jobs where project_id = p_project_id
             and status not in ('completed', 'failed', 'cancelled')) then
    raise exception 'job_in_progress';
  end if;
  update public.clips set status = 'deleted' where project_id = p_project_id and user_id = uid;
  update public.source_videos set status = 'deleted' where project_id = p_project_id and user_id = uid;
  update public.projects set deleted_at = now() where id = p_project_id and user_id = uid;
  insert into public.audit_log (actor_id, action, target) values (uid, 'project_deleted', p_project_id::text);
end $$;

revoke all on function public.delete_my_project(uuid) from public, anon;
grant execute on function public.delete_my_project(uuid) to authenticated;
