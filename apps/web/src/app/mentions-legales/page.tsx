import type { Metadata } from "next";
import { LegalPage, Value } from "@/components/legal/legal-page";
import { HOSTS, LEGAL, legalIsComplete } from "@/content/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: legalIsComplete(), follow: true },
};

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site et le service Clipera sont édités par <strong><Value v={LEGAL.publisherName} /></strong>,{" "}
          <Value v={LEGAL.legalForm} />, dont le siège est situé <Value v={LEGAL.address} />, immatriculé(e) sous le
          numéro <Value v={LEGAL.siret} />
          {LEGAL.vatNumber ? <>, TVA intracommunautaire {LEGAL.vatNumber}</> : null}.
        </p>
        <p>
          Directeur ou directrice de la publication : <Value v={LEGAL.publicationDirector} />.
          <br />
          Contact : <Value v={LEGAL.contactEmail} />.
        </p>
      </section>
      <section>
        <h2>Hébergement et prestataires techniques</h2>
        <ul>
          {HOSTS.map((h) => (
            <li key={h.name}>
              <strong>{h.name}</strong> — {h.role} ({h.location}) — <a href={h.url}>{h.url.replace("https://", "")}</a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          La marque Clipera, son logo, l&apos;interface et les contenus du site sont protégés. Toute reproduction sans
          autorisation est interdite. Les vidéos importées et les clips produits restent la propriété de leurs auteurs ou
          ayants droit (voir les <a href="/cgu">conditions d&apos;utilisation</a>).
        </p>
      </section>
      <section>
        <h2>Données personnelles</h2>
        <p>
          Le traitement des données est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>
    </LegalPage>
  );
}
