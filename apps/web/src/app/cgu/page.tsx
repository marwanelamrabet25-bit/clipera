import type { Metadata } from "next";
import { LegalPage, Value } from "@/components/legal/legal-page";
import { LEGAL, legalIsComplete } from "@/content/legal";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  robots: { index: legalIsComplete(), follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions encadrent l&apos;utilisation de Clipera, service édité par <Value v={LEGAL.publisherName} />,
          qui transforme des vidéos longues en clips courts. Créer un compte vaut acceptation de ces conditions.
        </p>
      </section>
      <section>
        <h2>2. Compte</h2>
        <p>
          Tu dois fournir une adresse e-mail valide et garder ton mot de passe confidentiel. Tu es responsable de
          l&apos;utilisation de ton compte. Un compte est personnel.
        </p>
      </section>
      <section>
        <h2>3. Offres et quotas</h2>
        <p>
          Chaque offre donne droit à un nombre de vidéos et de minutes de vidéo par mois, indiqués sur la page Abonnement.
          Un traitement qui échoue sans produire de clip ne consomme pas de quota. Les offres payantes, leurs prix et leurs
          conditions de paiement et de rétractation seront précisés avant leur ouverture.
        </p>
      </section>
      <section>
        <h2>4. Tes contenus</h2>
        <ul>
          <li>
            Tu déclares <strong>détenir les droits nécessaires</strong> sur chaque vidéo importée (auteur ou autorisation
            de l&apos;exploiter), y compris sur la musique, les images et les personnes qui y apparaissent.
          </li>
          <li>
            Tu restes propriétaire de tes vidéos et de tes clips. Tu autorises Clipera à les traiter{" "}
            <strong>uniquement pour te fournir le service</strong> (stockage, analyse, montage, téléchargement).
          </li>
          <li>
            Sont interdits les contenus illicites, haineux, violents, à caractère sexuel impliquant des mineurs, ou qui
            portent atteinte aux droits d&apos;autrui. Clipera peut supprimer un contenu manifestement illicite et suspendre
            le compte concerné.
          </li>
          <li>Clipera ne permet pas de télécharger des vidéos depuis des plateformes tierces.</li>
        </ul>
      </section>
      <section>
        <h2>5. Résultats</h2>
        <p>
          Les passages sont sélectionnés automatiquement et les notes affichées sont <strong>indicatives</strong>. Clipera ne
          garantit ni vues, ni viralité, ni revenus. Tu restes seul(e) juge de la publication de tes clips et responsable de
          leur diffusion.
        </p>
      </section>
      <section>
        <h2>6. Disponibilité et responsabilité</h2>
        <p>
          Nous faisons notre possible pour que le service soit disponible et fiable, sans pouvoir garantir une absence
          totale d&apos;interruption. Conserve une copie de tes vidéos originales : les vidéos sources sont supprimées 30 jours
          après leur import. Dans les limites autorisées par la loi, la responsabilité de l&apos;éditeur est limitée aux
          dommages directs et prévisibles.
        </p>
      </section>
      <section>
        <h2>7. Résiliation</h2>
        <p>
          Tu peux supprimer ton compte à tout moment depuis <strong>Paramètres → Supprimer mon compte</strong>, ou en écrivant à{" "}
          <Value v={LEGAL.contactEmail} /> ; tes
          données sont alors effacées. Nous pouvons suspendre un compte en cas de manquement grave à ces conditions.
        </p>
      </section>
      <section>
        <h2>8. Modifications, droit applicable et litiges</h2>
        <p>
          Ces conditions peuvent évoluer ; tu seras informé(e) des changements importants. Elles sont soumises au droit
          français. En cas de litige, contacte-nous d&apos;abord ; si tu es consommateur, tu peux recourir gratuitement au
          médiateur de la consommation : <Value v={LEGAL.consumerMediator} />.
        </p>
      </section>
    </LegalPage>
  );
}
