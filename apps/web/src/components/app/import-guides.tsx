import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

function Guide({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-md border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-small font-medium">
        {title}
        <ChevronDown className="size-4 shrink-0 text-subtle transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-4 py-3 text-small text-muted [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5">
        {children}
      </div>
    </details>
  );
}

/** Guides pas à pas pour obtenir un lien valide ou récupérer sa vidéo. */
export function ImportGuides() {
  return (
    <div className="flex flex-col gap-2" aria-label="Guides d'import">
      <Guide title="Obtenir un lien Google Drive">
        <ol>
          <li>Ouvre Google Drive (site ou application) et ajoute ta vidéo si elle n&apos;y est pas.</li>
          <li>
            Sur la vidéo : <strong>clic droit</strong> (ou <strong>⋮</strong> sur téléphone) → <strong>Partager</strong>.
          </li>
          <li>
            Dans <strong>Accès général</strong>, choisis <strong>« Tous les utilisateurs disposant du lien »</strong>.
          </li>
          <li>
            Clique sur <strong>Copier le lien</strong>, puis colle-le ici.
          </li>
        </ol>
        <p className="mt-2 text-caption text-subtle">
          Le lien doit être celui de la vidéo elle-même, pas celui d&apos;un dossier.
        </p>
      </Guide>
      <Guide title="Obtenir un lien Dropbox">
        <ol>
          <li>Ouvre Dropbox (site ou application) et trouve ta vidéo.</li>
          <li>
            Clique sur <strong>Partager</strong> (ou <strong>⋯</strong> → <strong>Partager</strong>).
          </li>
          <li>
            Vérifie que l&apos;accès est <strong>« Toute personne disposant du lien »</strong>, puis{" "}
            <strong>Copier le lien</strong>.
          </li>
          <li>Colle-le ici.</li>
        </ol>
      </Guide>
      <Guide title="Ma vidéo est sur YouTube">
        <p className="mb-2">Si c&apos;est ta chaîne, YouTube te permet de télécharger ta vidéo gratuitement :</p>
        <ol>
          <li>
            Sur un ordinateur, ouvre <strong>studio.youtube.com</strong> → <strong>Contenu</strong>.
          </li>
          <li>
            Survole ta vidéo → <strong>⋮ (Options)</strong> → <strong>Télécharger</strong>.
          </li>
          <li>
            Importe le fichier obtenu dans <strong>« Depuis un fichier »</strong> ci-dessous.
          </li>
        </ol>
        <p className="mt-2 text-caption text-subtle">
          Le téléchargement n&apos;est pas proposé dans l&apos;application mobile YouTube Studio : utilise un ordinateur.
        </p>
      </Guide>
      <Guide title="Je participe à une campagne de clipping">
        <p>
          Les créateurs fournissent généralement leurs vidéos dans un <strong>dossier Google Drive</strong> partagé.
          Ouvre la vidéo voulue dans ce dossier, copie <strong>son lien</strong> (⋮ → Partager → Copier le lien) et
          colle-le ici. Si le téléchargement est refusé, demande au créateur d&apos;ouvrir l&apos;accès « Tous les
          utilisateurs disposant du lien ».
        </p>
      </Guide>
    </div>
  );
}
