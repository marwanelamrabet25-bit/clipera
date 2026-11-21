-- Facturation Stripe : synchronisation des abonnements (webhooks) et quotas mensuels même en annuel.

alter table public.subscriptions
  add column billing_interval text check (billing_interval in ('month', 'year')),
  add column stripe_price_id text;

-- Événements Stripe déjà traités : un même webhook reçu deux fois n'est appliqué qu'une fois.
create table public.stripe_events (
  id          text primary key,
  type        text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;  -- aucune politique : invisible pour les utilisateurs

-- Offre effective et fenêtre de quota.
-- Abonnement payant actif → les quotas se renouvellent CHAQUE MOIS à partir de la date d'abonnement
-- (un abonnement annuel = 12 fenêtres mensuelles, pas un seul quota pour l'année) ; sinon → offre Free, mois UTC.
create or replace function public.effective_plan(p_user uuid,
  out plan_id text, out period_start timestamptz, out period_end timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare s public.subscriptions; a interval; n int;
begin
  select * into s from public.subscriptions where user_id = p_user;
  if found and s.status in ('active', 'trialing') and s.plan_id <> 'free'
     and s.current_period_start is not null and s.current_period_end > now() then
    plan_id := s.plan_id;
    a := age(greatest(now(), s.current_period_start), s.current_period_start);
    n := (extract(year from a) * 12 + extract(month from a))::int;
    period_start := s.current_period_start + make_interval(months => n);
    period_end := least(s.current_period_start + make_interval(months => n + 1), s.current_period_end);
  else
    plan_id := 'free';
    period_start := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
    period_end := period_start + interval '1 month';
  end if;
end $$;

-- Application d'un état d'abonnement reçu de Stripe (appelée uniquement par le serveur, rôle service).
-- L'offre est déduite du Price ID enregistré en base : jamais d'une donnée envoyée par le navigateur.
create function public.stripe_apply_subscription(
  p_user uuid, p_price_id text, p_status text, p_period_start timestamptz, p_period_end timestamptz,
  p_cancel_at_period_end boolean, p_customer_id text, p_subscription_id text)
returns text
language plpgsql security definer set search_path = public as $$
declare pl public.plans; interval_ text; st public.subscription_status;
begin
  select * into pl from public.plans where stripe_price_id = p_price_id or stripe_annual_price_id = p_price_id;
  if not found then raise exception 'unknown_price %', p_price_id using errcode = 'P0002'; end if;
  interval_ := case when pl.stripe_annual_price_id = p_price_id then 'year' else 'month' end;
  st := case p_status
          when 'active' then 'active' when 'trialing' then 'trialing' when 'past_due' then 'past_due'
          when 'canceled' then 'canceled' when 'unpaid' then 'unpaid'
          else 'incomplete' end;

  insert into public.subscriptions as s (user_id, plan_id, status, current_period_start, current_period_end,
      cancel_at_period_end, stripe_customer_id, stripe_subscription_id, billing_interval, stripe_price_id)
  values (p_user, case when st = 'canceled' then 'free' else pl.id end, st, p_period_start, p_period_end,
          coalesce(p_cancel_at_period_end, false), p_customer_id, p_subscription_id, interval_, p_price_id)
  on conflict (user_id) do update set
      plan_id = case when excluded.status = 'canceled' then 'free' else excluded.plan_id end,
      status = case when excluded.status = 'canceled' then 'active'::public.subscription_status else excluded.status end,
      current_period_start = case when excluded.status = 'canceled' then null else excluded.current_period_start end,
      current_period_end = case when excluded.status = 'canceled' then null else excluded.current_period_end end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      stripe_customer_id = coalesce(excluded.stripe_customer_id, s.stripe_customer_id),
      stripe_subscription_id = case when excluded.status = 'canceled' then null else excluded.stripe_subscription_id end,
      billing_interval = case when excluded.status = 'canceled' then null else excluded.billing_interval end,
      stripe_price_id = case when excluded.status = 'canceled' then null else excluded.stripe_price_id end;

  insert into public.audit_log (actor_id, action, target, data)
  values (p_user, 'stripe_subscription', p_subscription_id,
          jsonb_build_object('plan', pl.id, 'status', st, 'interval', interval_, 'period_end', p_period_end,
                             'cancel_at_period_end', p_cancel_at_period_end));
  return pl.id;
end $$;

-- Mémorise le client Stripe d'un utilisateur (avant le paiement), pour ne jamais en créer deux.
create function public.stripe_set_customer(p_user uuid, p_customer_id text) returns void
language sql security definer set search_path = public as $$
  update public.subscriptions set stripe_customer_id = p_customer_id
   where user_id = p_user and (stripe_customer_id is null or stripe_customer_id = p_customer_id);
$$;

revoke all on function public.stripe_apply_subscription(uuid, text, text, timestamptz, timestamptz, boolean, text, text)
  from public, anon, authenticated;
revoke all on function public.stripe_set_customer(uuid, text) from public, anon, authenticated;
grant execute on function public.stripe_apply_subscription(uuid, text, text, timestamptz, timestamptz, boolean, text, text)
  to service_role;
grant execute on function public.stripe_set_customer(uuid, text) to service_role;
grant all on public.stripe_events to service_role;
