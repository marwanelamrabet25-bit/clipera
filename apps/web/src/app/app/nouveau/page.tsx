import type { Metadata } from "next";
import { Upload } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { formatMinutes, getAccount } from "@/lib/account";

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
  const { plan } = await getAccount();
  return (
    <>
      <PageHeader title="Nouveau projet" description="Transforme une vidéo longue en clips courts." />
      <Alert tone="info" title="L'import de vidéos arrive très bientôt" className="mb-6">
        Nous connectons le stockage sécurisé des vidéos. Cette page deviendra active dès que l&apos;import sera
        réellement opérationnel.
      </Alert>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody className="flex flex-col items-center rounded-lg border border-dashed border-line-strong m-5 px-6 py-14 text-center">
            <div className="mb-4 grid size-12 place-items-center rounded-md border border-primary-line bg-primary-wash text-primary-soft">
              <Upload className="size-5" aria-hidden />
            </div>
            <p className="text-h3 font-semibold">Importe ta vidéo</p>
            <p className="mt-1 max-w-sm text-small text-muted">
              MP4 ou MOV
              {plan
                ? ` · jusqu'à ${formatMinutes(plan.max_video_seconds)} et ${Math.round(plan.max_upload_bytes / 1024 ** 3)} Go avec l'offre ${plan.name}`
                : ""}
              .
            </p>
            <Button className="mt-6" disabled>
              Choisir un fichier
            </Button>
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
