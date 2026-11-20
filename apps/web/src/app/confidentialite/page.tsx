import type { Metadata } from "next";
import { LegalPage, Value } from "@/components/legal/legal-page";
import { LEGAL, legalIsComplete } from "@/content/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: legalIsComplete(), follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <section>
        <p>
          Cette page explique quelles données Clipera traite, pourquoi, avec qui, combien de temps, et comment exercer tes
          droits. Responsable du traitement : <strong><Value v={LEGAL.publisherName} /></strong> (contact :{" "}
          <Value v={LEGAL.contactEmail} />).
        </p>
      </section>

      <section>
        <h2>Données traitées</h2>
        <ul>
          <li><strong>Compte</strong> : adresse e-mail, mot de passe (stocké sous forme chiffrée, jamais lisible), nom affiché.</li>
          <li><strong>Vidéos importées</strong> : le fichier et ses caractéristiques techniques (durée, résolution, son…).</li>
          <li><strong>Résultats</strong> : clips générés, et à venir : transcriptions et analyses des passages.</li>
          <li><strong>Utilisation</strong> : nombre de vidéos et de minutes traitées (quotas), historique des traitements.</li>
          <li><strong>Journaux techniques</strong> : adresse IP et informations de connexion, pour la sécurité et le diagnostic.</li>
        </ul>
      </section>

      <section>
        <h2>Pourquoi (finalités et bases légales)</h2>
        <ul>
          <li>Fournir le service : créer ton compte, traiter tes vidéos, produire tes clips — <em>exécution du contrat</em>.</li>
          <li>Sécuriser le service, prévenir les abus et la fraude — <em>intérêt légitime</em>.</li>
          <li>Facturation et comptabilité, quand les offres payantes seront ouvertes — <em>obligation légale</em>.</li>
        </ul>
        <p>
          Clipera ne vend pas tes données, n&apos;affiche pas de publicité et n&apos;utilise pas tes vidéos pour entraîner
          des modèles d&apos;intelligence artificielle.
        </p>
      </section>

      <section>
        <h2>Prestataires (sous-traitants)</h2>
        <ul>
          <li><strong>Supabase</strong> — base de données et comptes — Union européenne (Paris).</li>
          <li><strong>Cloudflare R2</strong> — stockage des vidéos et des clips — Union européenne.</li>
          <li><strong>Vercel</strong> — hébergement du site — États-Unis.</li>
          <li>
            À venir, lors de l&apos;ouverture de la génération de clips : un service de <strong>transcription</strong> (Deepgram
            ou AssemblyAI, États-Unis) et <strong>Anthropic</strong> (analyse du contenu par IA, États-Unis) ; puis
            <strong> Stripe</strong> pour les paiements. Cette liste sera mise à jour avant leur mise en service.
          </li>
        </ul>
        <p>
          Les transferts hors de l&apos;Union européenne sont encadrés par les garanties prévues par le RGPD (clauses
          contractuelles types de la Commission européenne ou cadre de protection des données UE–États-Unis).
        </p>
      </section>

      <section>
        <h2>Durées de conservation</h2>
        <ul>
          <li>Vidéos sources : supprimées automatiquement <strong>30 jours</strong> après leur import.</li>
          <li>Envois de vidéo non terminés : supprimés après <strong>24 heures</strong>.</li>
          <li>Compte, projets et clips : tant que ton compte existe. Tu peux le supprimer toi-même à tout moment (Paramètres) : tout est alors effacé immédiatement, fichiers compris.</li>
          <li>Données de facturation (à venir) : durée légale de conservation comptable (10 ans).</li>
        </ul>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Clipera utilise uniquement des cookies <strong>strictement nécessaires</strong> pour te garder connecté de manière
          sécurisée. Aucun cookie publicitaire ni de mesure d&apos;audience n&apos;est utilisé ; aucun consentement n&apos;est
          donc requis.
        </p>
      </section>

      <section>
        <h2>Tes droits</h2>
        <p>
          Tu peux demander l&apos;accès, la rectification, l&apos;effacement ou la portabilité de tes données, et t&apos;opposer
          à leur traitement ou en demander la limitation, en écrivant à <Value v={LEGAL.contactEmail} />. Nous répondons dans
          un délai d&apos;un mois. Tu peux aussi introduire une réclamation auprès de la CNIL (
          <a href="https://www.cnil.fr">cnil.fr</a>).
        </p>
      </section>
    </LegalPage>
  );
}
