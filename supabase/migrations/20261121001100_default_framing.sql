-- Mode de cadrage préféré de l'utilisateur (Stable par défaut), réutilisé à chaque nouvelle génération.
alter table public.user_settings
  add column default_framing text not null default 'stable' check (default_framing in ('stable', 'speaker', 'wide'));
grant update (default_framing) on public.user_settings to authenticated;
