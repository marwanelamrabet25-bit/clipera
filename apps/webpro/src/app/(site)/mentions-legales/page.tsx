import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { LegalSection, LegalValue } from "@/components/ui/legal";
import { legal, legalIsComplete } from "@/config/legal";
import { brand, contact, SITE_URL } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site de WEBPRO AGENCY : éditeur, directeur de la publication, hébergeur et propriété intellectuelle.",
  path: "/mentions-legales",
});

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ name: "Mentions légales", path: "/mentions-legales" }]} eyebrow="Informations légales" title={["Mentions légales"]} wide />
      <div className="shell pb-28 md:pb-40">
        {!legalIsComplete() && (
          <p role="note" className="mb-12 border-l-2 border-[#ffb020] bg-[#ffb020]/10 p-5 text-[#ffd58a]">
            Certaines informations obligatoires restent à compléter avant la mise en ligne (fichier <code>src/config/legal.ts</code>).
          </p>
        )}
        <LegalSection id="ml-editeur" title="Éditeur du site">
          <p>
            Le site <strong>{SITE_URL.replace(/^https?:\/\//, "")}</strong> est édité par{" "}
            <strong>
              <LegalValue value={legal.publisherName} label="nom de l'exploitant ou dénomination sociale" />
            </strong>
            , exerçant sous le nom commercial {brand.name}.
          </p>
          <ul className="space-y-1.5">
            <li>
              Forme juridique : <LegalValue value={legal.legalForm} label="statut juridique" />
            </li>
            <li>
              SIREN : <LegalValue value={legal.siren} label="numéro SIREN" />
            </li>
            <li>
              SIRET : <LegalValue value={legal.siret} label="numéro SIRET" />
            </li>
            <li>
              Immatriculation : <LegalValue value={legal.registration} label="RCS / RNE" />
            </li>
            <li>
              TVA : <LegalValue value={legal.vatNumber} label="n° de TVA intracommunautaire ou mention d'exonération" />
            </li>
            <li>
              Adresse : <LegalValue value={legal.registeredAddress} label="adresse du siège ou de domiciliation" />
            </li>
            <li>
              Email : <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              Téléphone : <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
            </li>
          </ul>
        </LegalSection>
        <LegalSection id="ml-direction" title="Directeur de la publication">
          <p>
            <LegalValue value={legal.publicationDirector} label="nom du directeur ou de la directrice de la publication" />
          </p>
        </LegalSection>
        <LegalSection id="ml-hebergeur" title="Hébergeur">
          <ul className="space-y-1.5">
            <li>
              <LegalValue value={legal.host.name} label="nom de l'hébergeur" />
            </li>
            <li>
              <LegalValue value={legal.host.address} label="adresse de l'hébergeur" />
            </li>
            <li>
              <LegalValue value={legal.host.phone} label="téléphone de l'hébergeur" />
            </li>
          </ul>
        </LegalSection>
        <LegalSection id="ml-pi" title="Propriété intellectuelle">
          <p>
            L&apos;ensemble des contenus de ce site (textes, logo, identité visuelle, mises en page, visuels) est la propriété de{" "}
            {brand.name}, sauf mention contraire. Toute reproduction ou réutilisation sans autorisation écrite préalable est
            interdite.
          </p>
          <p>
            Les exemples de maquettes, de publications et de vidéos présentés sur ce site concernent des entreprises fictives imaginées par {brand.name} ; ce ne sont pas des réalisations clients.
            Toute ressemblance avec une entreprise existante serait fortuite.
          </p>
        </LegalSection>
        <LegalSection id="ml-credits" title="Crédits">
          <ul className="space-y-1.5">
            <li>Conception et réalisation : {brand.name}.</li>
            <li>
              Carte du Doubs : contours et communes issus des données IGN / INSEE (Licence Ouverte Etalab), via le projet
              open source france-geojson.
            </li>
            <li>Polices de caractères : Manrope, Geist Mono, Fraunces et Archivo, sous licence SIL Open Font License 1.1.</li>
            <li>Icônes : Lucide (licence ISC).</li>
          </ul>
        </LegalSection>
        <LegalSection id="ml-donnees" title="Données personnelles et cookies">
          <p>
            Le traitement des données transmises via le formulaire de contact est décrit dans la{" "}
            <Link href="/politique-confidentialite">politique de confidentialité</Link>. Ce site n&apos;utilise aucun cookie de
            mesure d&apos;audience ou publicitaire.
          </p>
        </LegalSection>
        <LegalSection id="ml-maj" title="Mise à jour">
          <p>
            Dernière mise à jour : <LegalValue value={legal.lastUpdated} label="date" />
          </p>
        </LegalSection>
      </div>
    </>
  );
}
