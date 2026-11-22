"use client";

import { CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";

async function go(url: string, body?: unknown): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data?.error?.message ?? "Une erreur est survenue. Réessaie.");
  return data.url as string;
}

/**
 * Redirige vers la page de paiement sécurisée de Stripe (montant vérifié côté serveur).
 * Deux accords explicites sont exigés (et revérifiés par le serveur) : les CGV, et le démarrage immédiat du service
 * pendant le délai de rétractation (article L221-25 du Code de la consommation).
 */
export function PayButton({ plan, billing, label }: { plan: string; billing: "monthly" | "annual"; label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptCgv, setAcceptCgv] = useState(false);
  const [startNow, setStartNow] = useState(false);
  const ready = acceptCgv && startNow;
  return (
    <div className="mt-6 flex flex-col gap-3">
      <label className="flex cursor-pointer items-start gap-3 text-small text-muted">
        <input
          type="checkbox"
          id="accept-cgv"
          checked={acceptCgv}
          onChange={(e) => setAcceptCgv(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>
          J&apos;ai lu et j&apos;accepte les{" "}
          <a href="/cgv" target="_blank" className="text-primary-soft underline">
            conditions générales de vente
          </a>
          .
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-small text-muted">
        <input
          type="checkbox"
          id="start-now"
          checked={startNow}
          onChange={(e) => setStartNow(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>
          Je demande que mon abonnement commence immédiatement. Je sais que si j&apos;exerce mon droit de rétractation dans
          les 14 jours, seule la part du service déjà fournie restera due.
        </span>
      </label>
      <Button
        size="lg"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={!ready}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            window.location.assign(await go("/api/billing/checkout", { plan, billing, acceptCgv, startNow }));
          } catch (e) {
            setError((e as Error).message);
            setPending(false);
          }
        }}
      >
        <Lock /> {label}
      </Button>
      <p className="text-caption text-subtle">Paiement sécurisé par Stripe. Clipera ne voit jamais ta carte bancaire.</p>
      {error && <Alert tone="danger" title="Paiement non ouvert">{error}</Alert>}
    </div>
  );
}

/** Espace client Stripe : factures, carte bancaire, changement d'offre, résiliation. */
export function ManageButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondary"
        loading={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            window.location.assign(await go("/api/billing/portal"));
          } catch (e) {
            setError((e as Error).message);
            setPending(false);
          }
        }}
      >
        <CreditCard /> Gérer mon abonnement
      </Button>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
