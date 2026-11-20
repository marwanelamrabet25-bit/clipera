import "server-only";
import { cache } from "react";
import type { Tables } from "./supabase/database.types";
import { createClient, requireUser } from "./supabase/server";

export type Quota = {
  planId: string;
  periodStart: string;
  periodEnd: string;
  videosUsed: number;
  videosLimit: number;
  secondsUsed: number;
  secondsLimit: number;
};

export type Account = {
  user: { id: string; email: string | null };
  displayName: string;
  profile: Tables<"profiles"> | null;
  plan: Tables<"plans"> | null;
  quota: Quota | null;
};

/** Toutes les infos du compte connecté, lues dans la base sous la RLS (une fois par requête). */
export const getAccount = cache(async (): Promise<Account> => {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: profile }, { data: quotaRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.rpc("my_quota"),
  ]);
  const q = quotaRows?.[0];
  const quota: Quota | null = q
    ? {
        planId: q.plan_id,
        periodStart: q.period_start,
        periodEnd: q.period_end,
        videosUsed: q.videos_used,
        videosLimit: q.videos_limit,
        secondsUsed: q.seconds_used,
        secondsLimit: q.seconds_limit,
      }
    : null;
  const { data: plan } = quota
    ? await supabase.from("plans").select("*").eq("id", quota.planId).maybeSingle()
    : { data: null };
  const displayName = profile?.display_name?.trim() || (user.email ? user.email.split("@")[0] : "toi");
  return { user, displayName, profile, plan, quota };
});

export function formatMinutes(seconds: number) {
  const m = Math.floor(Math.max(seconds, 0) / 60);
  return `${m} min`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(iso));
}

export function formatPrice(cents: number) {
  return cents === 0
    ? "0 €"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}
