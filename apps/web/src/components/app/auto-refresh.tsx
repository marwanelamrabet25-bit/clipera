"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Recharge les données de la page à intervalle régulier tant qu'un traitement est en cours. */
export function AutoRefresh({ active, intervalMs = 3000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(t);
  }, [active, intervalMs, router]);
  return null;
}
