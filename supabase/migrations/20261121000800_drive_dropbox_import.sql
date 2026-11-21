-- Import par lien Google Drive et Dropbox (en plus de YouTube, masqué côté site).
-- Le lien est reconnu et RECONSTRUIT ici à partir de ses identifiants : seuls des liens Drive/Dropbox/YouTube
-- canoniques atteignent le worker (aucune adresse libre → pas de requête vers un serveur arbitraire).

alter table public.source_videos drop constraint if exists source_videos_source_url_check;
alter table public.source_videos add constraint source_videos_source_url_check check (
  source_url is null
  or source_url ~ '^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}$'
  or source_url ~ '^https://drive\.google\.com/file/d/[A-Za-z0-9_-]{20,100}$'
  or source_url ~ '^https://www\.dropbox\.com/(s|scl/fi)/[A-Za-z0-9_./%-]{1,255}(\?rlkey=[A-Za-z0-9]{1,100})?$'
);

-- Fournisseur + lien canonique, ou NULL si le lien n'est pas reconnu.
create function public.normalize_import_url(p_url text, out provider text, out url text)
language plpgsql immutable set search_path = public as $$
declare u text := trim(coalesce(p_url, '')); id text; path text; rlkey text;
begin
  if char_length(u) > 600 or u ~ '\s' then return; end if;

  id := public.youtube_video_id(u);
  if id is not null then
    provider := 'youtube'; url := 'https://www.youtube.com/watch?v=' || id; return;
  end if;

  if u ~* '^(https?://)?(drive|docs)\.google\.com/' or u ~* '^(https?://)?drive\.usercontent\.google\.com/' then
    id := coalesce(substring(u from '/file/d/([A-Za-z0-9_-]{20,100})'),
                   substring(u from '[?&]id=([A-Za-z0-9_-]{20,100})'));
    if id is not null then
      provider := 'gdrive'; url := 'https://drive.google.com/file/d/' || id;
    end if;
    return;
  end if;

  if u ~* '^(https?://)?(www\.)?dropbox\.com/' then
    path := substring(u from '(?i)dropbox\.com(/(?:s|scl/fi)/[A-Za-z0-9_./%-]{1,255})');
    rlkey := substring(u from '[?&]rlkey=([A-Za-z0-9]{1,100})');
    if path is not null and path !~ '\.\.' then
      provider := 'dropbox'; url := 'https://www.dropbox.com' || path || coalesce('?rlkey=' || rlkey, '');
    end if;
    return;
  end if;
end $$;

create or replace function public.create_url_import(p_url text, p_rights_confirmed boolean)
returns table (source_video_id uuid, project_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  n record;
  ep record;
  pl public.plans;
  used_videos int;
  pending int;
  v_id uuid := gen_random_uuid();
  p_id uuid;
  label text;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_rights_confirmed is not true then raise exception 'rights_not_confirmed' using errcode = '22023'; end if;
  select * into n from public.normalize_import_url(p_url);
  if n.url is null then raise exception 'invalid_url' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended('quota:' || uid::text, 0));
  select * into ep from public.effective_plan(uid);
  select * into pl from public.plans where id = ep.plan_id;

  select coalesce(sum(source_videos), 0) into used_videos
    from public.usage_records where user_id = uid and period_start = ep.period_start;
  if used_videos >= pl.monthly_source_videos then
    raise exception 'quota_videos_exceeded' using errcode = '53400';
  end if;

  select count(*) into pending from public.source_videos
    where user_id = uid and status in ('pending_upload', 'importing') and created_at > now() - interval '1 day';
  if pending >= 3 then raise exception 'too_many_pending_uploads' using errcode = '53400'; end if;

  label := case n.provider when 'gdrive' then 'Google Drive' when 'dropbox' then 'Dropbox' else 'YouTube' end;
  insert into public.projects (user_id, title) values (uid, 'Vidéo ' || label) returning id into p_id;
  insert into public.source_videos
    (id, project_id, user_id, status, storage_key, original_filename, declared_size_bytes, rights_confirmed_at,
     purge_after, source_url)
  values (v_id, p_id, uid, 'importing', 'sources/' || uid::text || '/' || v_id::text || '/source.mp4',
          n.provider || '-import.mp4', 1, now(), now() + interval '30 days', n.url);

  insert into public.processing_jobs
    (kind, user_id, project_id, source_video_id, options, priority, idempotency_key, max_attempts)
  values ('import_url', uid, p_id, v_id, jsonb_build_object('url', n.url, 'provider', n.provider),
          100, 'import:' || v_id::text, 2);

  return query select v_id, p_id;
end $$;
