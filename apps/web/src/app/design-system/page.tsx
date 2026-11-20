import type { Metadata } from "next";
import { Film, FolderOpen, Sparkles, Upload } from "lucide-react";
import { AppIcon, Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { PipelineSteps } from "@/components/ui/pipeline-steps";
import { EditingOptionsDemo } from "./options-demo";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const colors = [
  { name: "Violet principal", token: "primary", hex: "#8B5CF6", cls: "bg-primary" },
  { name: "Violet clair", token: "primary-soft", hex: "#A78BFA", cls: "bg-primary-soft" },
  { name: "Noir profond", token: "canvas", hex: "#0B0B10", cls: "bg-canvas" },
  { name: "Surface", token: "surface", hex: "#121219", cls: "bg-surface" },
  { name: "Gris foncé", token: "elevated", hex: "#1A1A24", cls: "bg-elevated" },
  { name: "Blanc cassé", token: "fg", hex: "#F8F9FF", cls: "bg-fg" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 text-caption font-semibold tracking-[0.12em] text-subtle uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Logo size={36} />
          <h1 className="mt-6 text-h1 font-bold">Design system</h1>
          <p className="mt-2 max-w-xl text-muted">
            Les composants de base de Clipera. Chaque écran de l&apos;application est construit uniquement avec ces
            éléments.
          </p>
        </div>
        <Badge tone="primary">v0.1 · interne</Badge>
      </header>

      <Section title="Couleurs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {colors.map((c) => (
            <div key={c.token} className="overflow-hidden rounded-md border border-line">
              <div className={`h-16 ${c.cls}`} />
              <div className="bg-surface p-3">
                <p className="text-small font-medium">{c.name}</p>
                <p className="font-mono text-caption text-subtle">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie — Inter">
        <div className="flex flex-col gap-4">
          <p className="text-display font-bold">Transforme tes vidéos.</p>
          <p className="text-h1 font-bold text-primary-soft">Multiplie tes opportunités.</p>
          <p className="text-h2 font-semibold">Titre de section</p>
          <p className="text-h3 font-semibold">Titre de carte</p>
          <p className="max-w-2xl text-body text-muted">
            Texte courant. Clipera analyse le contenu de ta vidéo, repère les passages qui tiennent debout seuls et
            les transforme en clips verticaux prêts à publier.
          </p>
          <p className="text-small text-muted">Texte secondaire · 13 px</p>
          <p className="text-caption text-subtle">Légende · 12 px</p>
        </div>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Upload /> Importer une vidéo
          </Button>
          <Button variant="secondary">Voir les clips</Button>
          <Button variant="ghost">Annuler</Button>
          <Button variant="danger">Supprimer</Button>
          <Button loading>Envoi…</Button>
          <Button disabled>Désactivé</Button>
          <Button size="lg">
            <Sparkles /> Générer les clips
          </Button>
          <Button size="sm" variant="secondary">
            Petit
          </Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Free</Badge>
          <Badge tone="primary">Pro</Badge>
          <Badge tone="success">Prêt</Badge>
          <Badge tone="warning">Quota bientôt atteint</Badge>
          <Badge tone="danger">Échec</Badge>
        </div>
      </Section>

      <Section title="Champs et options">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Field label="Nom du projet" placeholder="Podcast épisode 12" hint="Visible uniquement par toi." />
            <Field label="Adresse e-mail" type="email" defaultValue="adresse-invalide" error="Adresse e-mail invalide." />
          </div>
          <Card>
            <CardBody>
              <EditingOptionsDemo />
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="Messages">
        <div className="flex flex-col gap-3">
          <Alert title="Analyse terminée">3 passages de qualité trouvés. Nous n&apos;en générons pas davantage pour atteindre un quota.</Alert>
          <Alert tone="success" title="Clips prêts au téléchargement" />
          <Alert tone="warning" title="Il te reste 12 minutes ce mois-ci">Ta prochaine vidéo dure 18 minutes.</Alert>
          <Alert tone="danger" title="Cette vidéo n'a pas de son" action={<Button size="sm" variant="secondary">Réessayer</Button>}>
            Clipera a besoin de la parole pour trouver les meilleurs passages. Ton quota n&apos;a pas été utilisé.
          </Alert>
        </div>
      </Section>

      <Section title="Suivi du traitement">
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["En cours", "analyzing", undefined],
              ["Terminé", "completed", undefined],
              ["Échec", "failed", "rendering"],
            ] as const
          ).map(([label, status, failedAt]) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardBody>
                <PipelineSteps status={status} failedAt={failedAt} />
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="États vides et chargement">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            icon={<FolderOpen />}
            title="Aucun projet pour l'instant"
            description="Importe ta première vidéo longue : Clipera en tire des clips courts prêts à publier."
            action={
              <Button>
                <Upload /> Nouveau projet
              </Button>
            }
          />
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Derniers clips</CardTitle>
                <CardDescription>Chargement…</CardDescription>
              </div>
              <Film className="size-4 text-subtle" aria-hidden />
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-14 w-9 rounded-sm" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-6">
          <Logo size={40} />
          <AppIcon size={56} />
          <div className="rounded-md bg-fg px-4 py-3">
            <Logo size={32} onLight />
          </div>
        </div>
      </Section>
    </main>
  );
}
