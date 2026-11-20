-- Maintenance automatique (toutes les heures via pg_cron sur Supabase).
-- Les fichiers eux-mêmes sont supprimés par les règles de cycle de vie du bucket R2 (voir docs/DEPLOYMENT.md) :
-- morceaux d'envois abandonnés après 1 jour, objets sources/ après 30 jours. Cette fonction aligne la base.

create function public.run_maintenance()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  stale_uploads int;
  expired_sources int;
  requeued int;
  result jsonb;
begin
  -- 1. Envois jamais terminés depuis plus de 24 h : vidéo et projet masqués.
  with stale as (
    update public.source_videos set status = 'deleted'
     where status = 'pending_upload' and created_at < now() - interval '24 hours'
    returning project_id),
  hidden as (
    update public.projects p set deleted_at = now()
      from stale where p.id = stale.project_id and p.deleted_at is null
    returning p.id)
  select count(*) into stale_uploads from stale;

  -- 2. Vidéos sources arrivées à expiration (le fichier est supprimé du stockage par la règle de cycle de vie).
  --    On ne touche jamais une vidéo dont un traitement est en cours. Les clips déjà produits sont conservés.
  update public.source_videos sv set status = 'deleted'
   where sv.status in ('uploaded', 'validated', 'rejected')
     and sv.purge_after is not null and sv.purge_after < now()
     and not exists (
       select 1 from public.processing_jobs j
        where j.source_video_id = sv.id and j.status not in ('completed', 'failed', 'cancelled'));
  get diagnostics expired_sources = row_count;

  -- 3. Traitements dont le worker ne donne plus signe de vie (filet de sécurité si aucun worker ne tourne).
  requeued := public.requeue_stale_jobs();

  result := jsonb_build_object('stale_uploads', stale_uploads, 'expired_sources', expired_sources,
                               'requeued_jobs', requeued);
  if stale_uploads + expired_sources + requeued > 0 then
    insert into public.audit_log (action, data) values ('maintenance', result);
  end if;
  return result;
end $$;

revoke all on function public.run_maintenance() from public, anon, authenticated;
grant execute on function public.run_maintenance() to service_role;

-- Planification horaire (uniquement là où pg_cron est disponible, c'est-à-dire sur Supabase).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('clipera-maintenance', '17 * * * *', 'select public.run_maintenance()');
  end if;
end $$;
