-- Performance et durcissement (recommandations du contrôle Supabase). Aucune donnée modifiée, aucune règle élargie :
-- 1) auth.uid() évalué une seule fois par requête (et non à chaque ligne) dans les règles d'accès ;
-- 2) index sur les clés étrangères non indexées ;
-- 3) la fonction déclencheur on_import_job_failed n'est plus exposée via l'API.

alter policy clips_own_read on public.clips using (((user_id = (select auth.uid())) AND (status <> 'deleted'::clip_status)));
alter policy events_own_read on public.job_events using ((user_id = (select auth.uid())));
alter policy jobs_own_read on public.processing_jobs using ((user_id = (select auth.uid())));
alter policy profiles_own_read on public.profiles using ((id = (select auth.uid())));
alter policy profiles_own_update on public.profiles using ((id = (select auth.uid()))) with check ((id = (select auth.uid())));
alter policy projects_own_read on public.projects using (((user_id = (select auth.uid())) AND (deleted_at IS NULL)));
alter policy projects_own_update on public.projects using (((user_id = (select auth.uid())) AND (deleted_at IS NULL))) with check ((user_id = (select auth.uid())));
alter policy referral_codes_own on public.referral_codes using ((user_id = (select auth.uid())));
alter policy referrals_own on public.referrals using (((referrer_id = (select auth.uid())) OR (referee_id = (select auth.uid()))));
alter policy sv_own_read on public.source_videos using (((user_id = (select auth.uid())) AND (status <> 'deleted'::source_video_status)));
alter policy subs_own_read on public.subscriptions using ((user_id = (select auth.uid())));
alter policy usage_own_read on public.usage_records using ((user_id = (select auth.uid())));
alter policy settings_own_read on public.user_settings using ((user_id = (select auth.uid())));
alter policy settings_own_update on public.user_settings using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

create index if not exists clips_source_video_idx on public.clips (source_video_id);
create index if not exists job_events_user_idx on public.job_events (user_id);
create index if not exists processing_jobs_source_video_idx on public.processing_jobs (source_video_id);
create index if not exists subscriptions_plan_idx on public.subscriptions (plan_id);

revoke all on function public.on_import_job_failed() from public, anon, authenticated;
