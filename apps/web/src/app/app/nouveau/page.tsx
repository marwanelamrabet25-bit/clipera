import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { LinkImport } from "@/components/app/link-import";
import { Uploader } from "@/components/app/uploader";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { formatMinutes, getAccount } from "@/lib/account";
import { isStorageConfigured } from "@/lib/storage";

export const metadata: Metadata = { title: "Nouveau projet" };

const STEPS = [
  "Importer une vidéo",
  "Vérifier les informations",
  "Choisir les options de montage",
  "Lancer l'analyse",
  "Suivre le traitement",
  "Consulter les clips",
  "Prévisualiser, modifier et télécharger",
];

export default async function NewProjectPage() {
  const { plan, quota } = await getAccount();
  const storageReady = isStorageConfigured();
  const videosLeft = quota ? quota.videosLimit - quota.videosUsed : 0;
  return (
    <>
      <PageHeader title="Nouveau projet" description="Transforme une vidéo longue en clips courts." />
      {!storageReady && (
        <Alert tone="info" title="L'import de vidéos arrive très bientôt" className="mb-6">
          Le stockage sécurisé des vidéos n&apos;est pas encore connecté. Cette page deviendra active dès qu&apos;il le
          sera.
        </Alert>
      )}
      {storageReady && videosLeft <= 0 && (
        <Alert tone="warning" title="Tu as utilisé toutes tes vidéos ce mois-ci" className="mb-6">
          Ton quota se renouvelle au début de la prochaine période.
        </Alert>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody>
            {storageReady && videosLeft > 0 && plan ? (
              <div className="flex flex-col gap-8">
                <section aria-labelledby="link-title">
                  <h2 id="link-title" className="mb-4 text-h3 font-semibold">
                    Depuis un lien YouTube
                  </h2>
                  <LinkImport maxMinutes={Math.floor(plan.max_video_seconds / 60)} />
                </section>
                <div className="flex items-center gap-3 text-caption text-subtle" aria-hidden>
                  <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
                </div>
                <section aria-labelledby="file-title">
                  <h2 id="file-title" className="mb-4 text-h3 font-semibold">
                    Depuis un fichier
                  </h2>
                  <Uploader maxBytes={plan.max_upload_bytes} planName={plan.name} />
                </section>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-line-strong px-6 py-14 text-center text-small text-muted">
                Import indisponible pour le moment.
              </div>
            )}
            {plan && (
              <p className="mt-4 text-caption text-subtle">
                Offre {plan.name} : vidéos de {formatMinutes(plan.max_video_seconds)} maximum ·{" "}
                {Math.round(plan.max_upload_bytes / 1024 ** 3)} Go maximum · {Math.max(videosLeft, 0)} vidéo(s) restante(s)
                ce mois-ci.
              </p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="mb-4 text-small font-semibold">Comment ça marche</p>
            <ol className="flex flex-col gap-3">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-3 text-small text-muted">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-caption text-subtle">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
