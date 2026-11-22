-- Programme de parrainage.
-- Filleul : -50 % sur son premier mois (abonnement mensuel), tant que son parrainage est « en attente ».
-- Parrain : 1 mois de son offre (ou de Starter s'il est en gratuit) crédité sur son compte Stripe, UNIQUEMENT
-- quand le filleul a réellement payé (facture > 0 €). Garde-fous : pas d'auto-parrainage, un seul parrain par
-- filleul, rattachement dans les 7 jours suivant l'inscription, 12 mois offerts maximum par parrain sur 12 mois.

create table public.referral_codes (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  code       text not null unique check (code ~ '^[A-Z2-9]{8}$'),
  created_at timestamptz not null default now()
);

create type public.referral_status as enum ('pending', 'rewarded');

create table public.referrals (
  id                 uuid primary key default gen_random_uuid(),
  referrer_id        uuid not null references auth.users (id) on delete cascade,
  referee_id         uuid not null unique references auth.users (id) on delete cascade,
  status             public.referral_status not null default 'pending',
  credit_cents       integer check (credit_cents >= 0),
  created_at         timestamptz not null default now(),
  rewarded_at        timestamptz,
  stripe_credited_at timestamptz,
  check (referrer_id <> referee_id)
);
create index referrals_referrer_idx on public.referrals (referrer_id);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
create policy referral_codes_own on public.referral_codes for select to authenticated using (user_id = auth.uid());
create policy referrals_own on public.referrals for select to authenticated
  using (referrer_id = auth.uid() or referee_id = auth.uid());
grant select on public.referral_codes, public.referrals to authenticated;
grant all on public.referral_codes, public.referrals to service_role;

-- Code de parrainage de l'utilisateur connecté (créé au premier appel). Alphabet sans 0/O/1/I pour éviter les confusions.
create function public.my_referral_code() returns text
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  c text;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select code into c from public.referral_codes where user_id = uid;
  if c is not null then return c; end if;
  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      into c from generate_series(1, 8);
    begin
      insert into public.referral_codes (user_id, code) values (uid, c);
      return c;
    exception when unique_violation then
      select code into c from public.referral_codes where user_id = uid;
      if c is not null then return c; end if;  -- appel concurrent : le code existe déjà
    end;
  end loop;
end $$;

-- Rattache l'utilisateur connecté (filleul) au parrain du code. Renvoie : ok, already, unknown, self, too_late, customer.
create function public.claim_referral(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  ref uuid;
  joined timestamptz;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from public.referrals where referee_id = uid) then return 'already'; end if;
  select user_id into ref from public.referral_codes where code = upper(trim(coalesce(p_code, '')));
  if ref is null then return 'unknown'; end if;
  if ref = uid then return 'self'; end if;
  select created_at into joined from auth.users where id = uid;
  if joined < now() - interval '7 days' then return 'too_late'; end if;
  -- Déjà client payant (ou l'a été) : le parrainage ne concerne que les nouveaux clients.
  if exists (select 1 from public.subscriptions where user_id = uid and stripe_subscription_id is not null) then
    return 'customer';
  end if;
  insert into public.referrals (referrer_id, referee_id) values (ref, uid) on conflict (referee_id) do nothing;
  return 'ok';
end $$;

-- Appelé par le webhook quand le filleul a payé une facture > 0 € : passe le parrainage à « récompensé » et fixe le
-- crédit du parrain (1 mois de son offre, Starter s'il est en gratuit ; 0 au-delà de 12 mois offerts sur 12 mois).
-- Renvoie aussi un parrainage déjà récompensé dont le crédit Stripe n'a pas encore été versé (reprise après erreur).
create function public.referral_reward(p_referee uuid)
returns table (referral_id uuid, referrer_id uuid, credit_cents integer)
language plpgsql security definer set search_path = public as $$
declare
  r public.referrals%rowtype;
  credit integer;
  given integer;
begin
  select * into r from public.referrals where referee_id = p_referee for update;
  if not found then return; end if;
  if r.status = 'pending' then
    select count(*) into given from public.referrals x
     where x.referrer_id = r.referrer_id and x.status = 'rewarded' and x.credit_cents > 0
       and x.rewarded_at > now() - interval '365 days';
    select case when p.price_cents > 0 then p.price_cents
                else (select price_cents from public.plans where id = 'starter') end
      into credit from public.effective_plan(r.referrer_id) e join public.plans p on p.id = e.plan_id;
    if given >= 12 then credit := 0; end if;
    update public.referrals set status = 'rewarded', rewarded_at = now(), credit_cents = coalesce(credit, 0)
     where id = r.id returning * into r;
    insert into public.audit_log (actor_id, action, target, data)
    values (r.referrer_id, 'referral_rewarded', r.id::text, jsonb_build_object('referee', p_referee, 'credit_cents', r.credit_cents));
  end if;
  if r.credit_cents > 0 and r.stripe_credited_at is null then
    referral_id := r.id; referrer_id := r.referrer_id; credit_cents := r.credit_cents;
    return next;
  end if;
end $$;

create function public.referral_mark_credited(p_referral uuid) returns void
language sql security definer set search_path = public as $$
  update public.referrals set stripe_credited_at = now() where id = p_referral and stripe_credited_at is null;
$$;

revoke all on function public.my_referral_code() from public, anon;
revoke all on function public.claim_referral(text) from public, anon;
grant execute on function public.my_referral_code() to authenticated;
grant execute on function public.claim_referral(text) to authenticated;
revoke all on function public.referral_reward(uuid) from public, anon, authenticated;
revoke all on function public.referral_mark_credited(uuid) from public, anon, authenticated;
grant execute on function public.referral_reward(uuid) to service_role;
grant execute on function public.referral_mark_credited(uuid) to service_role;
