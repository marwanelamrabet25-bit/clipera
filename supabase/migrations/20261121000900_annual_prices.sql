-- Facturation annuelle : 2 mois offerts sur chaque offre payante (payée en une seule fois).
-- Prix en centimes, TTC. Les quotas et fonctionnalités des offres ne changent pas.

alter table public.plans
  add column annual_price_cents integer not null default 0 check (annual_price_cents >= 0),
  add column stripe_annual_price_id text unique;

-- La colonne existante stripe_price_id reste celle du prix MENSUEL.
comment on column public.plans.stripe_price_id is 'Price ID Stripe du prix mensuel';
comment on column public.plans.stripe_annual_price_id is 'Price ID Stripe du prix annuel (payé en une fois)';

update public.plans set annual_price_cents = case id
  when 'starter' then 9990
  when 'pro' then 19990
  when 'ultimate' then 39990
  else 0 end;

-- Garde-fou : un prix annuel est soit nul (offre gratuite), soit inférieur à 12 mensualités.
alter table public.plans add constraint plans_annual_price_coherent
  check ((price_cents = 0 and annual_price_cents = 0) or (annual_price_cents > 0 and annual_price_cents < 12 * price_cents));
