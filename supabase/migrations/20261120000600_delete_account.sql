-- Suppression du compte par l'utilisateur lui-même (droit à l'effacement, RGPD).
-- Supprime l'utilisateur d'auth.users : toutes ses données suivent par cascade (profil, abonnement, projets,
-- vidéos, traitements, clips, consommation). Les fichiers du stockage sont supprimés AVANT par le serveur web.
create function public.delete_my_account()
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  -- Trace minimale, sans donnée personnelle (l'identifiant interne n'est plus rattaché à rien après suppression).
  insert into public.audit_log (actor_id, action) values (uid, 'account_deleted');
  delete from auth.users where id = uid;
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
