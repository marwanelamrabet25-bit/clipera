import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { LegalSection, LegalValue } from "@/components/ui/legal";
import { legal } from "@/config/legal";
import { brand, contact } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité",
  description:
    "Comment WEBPRO AGENCY traite les données transmises via son formulaire de contact : finalités, durée de conservation, destinataires et droits RGPD.",
  path: "/politique-confidentialite",
});

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Politique de confidentialité", path: "/politique-confidentialite" }]}
        eyebrow="Données personnelles"
        title={["Politique de confidentialité"]}
        wide
        lead={<p>Ce site collecte le minimum de données : uniquement ce que vous choisissez de nous transmettre pour être recontacté.</p>}
      />
      <div className="shell pb-28 md:pb-40">
        <LegalSection id="pc-responsable" title="Responsable du traitement">
          <p>
            <LegalValue value={legal.publisherName} label="nom de l'exploitant" />, exerçant sous le nom {brand.name} —{" "}
            <LegalValue value={legal.registeredAddress} label="adresse" />. Contact :{" "}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </p>
        </LegalSection>
        <LegalSection id="pc-donnees" title="Données collectées">
          <p>Uniquement les informations que vous saisissez dans nos formulaires :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              formulaire de contact : prénom, nom, entreprise (facultatif), adresse email, téléphone (facultatif), prestation
              souhaitée, budget envisagé (facultatif) et message ;
            </li>
            <li>
              demande de maquette gratuite : nom, entreprise, adresse email, téléphone (facultatif), secteur d&apos;activité,
              description de l&apos;entreprise, adresse du site existant (facultatif) et informations complémentaires
              (facultatif).
            </li>
          </ul>
          <p>Aucune donnée n&apos;est collectée à votre insu. Le site ne dépose pas de cookie de mesure d&apos;audience ni de cookie publicitaire.</p>
        </LegalSection>
        <LegalSection id="pc-finalite" title="Finalité et base légale">
          <p>
            Les données servent exclusivement à <strong>répondre à votre demande</strong>, à <strong>préparer la maquette demandée</strong> et, le cas échéant, à <strong>établir une proposition commerciale</strong>. Le traitement repose sur votre consentement, recueilli dans le formulaire, et sur
            les mesures précontractuelles prises à votre demande (article 6.1 a et b du RGPD).
          </p>
          <p>Elles ne sont ni vendues, ni cédées, ni utilisées à des fins de prospection sans votre accord.</p>
          <p>
            Si l&apos;accusé de réception automatique est activé, un email de confirmation vous est envoyé à l&apos;adresse saisie,
            sans autre usage.
          </p>
        </LegalSection>
        <LegalSection id="pc-destinataires" title="Destinataires et prestataires">
          <p>
            Les demandes sont transmises par email à {brand.name} uniquement ({contact.email}). Seuls les prestataires techniques
            indispensables y ont accès, dans la stricte limite de leur mission :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Vercel Inc.</strong> (États-Unis) : hébergement du site ;
            </li>
            <li>
              <strong>Resend</strong> (États-Unis) : acheminement des emails envoyés depuis les formulaires ;
            </li>
            <li>
              <strong>Google</strong> (messagerie Gmail de l&apos;agence) : réception des demandes.
            </li>
          </ul>
          <p>
            Ces prestataires peuvent traiter des données hors de l&apos;Union européenne. Garanties applicables :{" "}
            <LegalValue value={null} label="garanties de transfert (clauses contractuelles types, cadre UE–États-Unis…) à vérifier pour chaque prestataire" />
          </p>
          <p>Aucune donnée n&apos;est vendue, cédée ou transmise à d&apos;autres tiers.</p>
        </LegalSection>
        <LegalSection id="pc-duree" title="Durée de conservation">
          <p>
            Les demandes sont conservées le temps nécessaire au traitement de votre demande puis, si aucune relation commerciale
            ne s&apos;ensuit, au maximum <LegalValue value={null} label="durée retenue (la CNIL recommande 3 ans après le dernier contact pour les données de prospects)" />.
          </p>
        </LegalSection>
        <LegalSection id="pc-droits" title="Vos droits">
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et
            de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment. Pour les exercer,
            écrivez à <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              www.cnil.fr
            </a>
            ).
          </p>
        </LegalSection>
        <LegalSection id="pc-cookies" title="Cookies">
          <p>
            Ce site n&apos;utilise ni outil de mesure d&apos;audience, ni traceur publicitaire, ni contenu tiers déposant des
            cookies. Aucun bandeau de consentement n&apos;est donc nécessaire. Si un outil de ce type était ajouté, cette page
            serait mise à jour et votre consentement recueilli au préalable lorsque la loi l&apos;exige.
          </p>
        </LegalSection>
        <LegalSection id="pc-maj" title="Mise à jour">
          <p>
            Dernière mise à jour : <LegalValue value={legal.lastUpdated} label="date" />
          </p>
        </LegalSection>
      </div>
    </>
  );
}
