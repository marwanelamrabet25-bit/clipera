import type { Metadata } from "next";
import { LegalPage, Value } from "@/components/legal/legal-page";
import { CGV_VERSION, LEGAL, legalIsComplete } from "@/content/legal";
import { euros } from "@/lib/pricing";
import { getPublicPlans } from "@/lib/public-plans";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente des abonnements Clipera : prix, paiement, renouvellement, résiliation, droit de rétractation et réclamations.",
  alternates: { canonical: "/cgv" },
  robots: { index: legalIsComplete(), follow: true },
};

/**
 * Conditions générales de vente des abonnements. Les prix affichés sont lus en base (même source que le paiement).
 * Règles de vente à distance : Code de la consommation, articles L221-1 et suivants (rétractation : L221-18,
 * service commencé à la demande du consommateur : L221-25, formulaire type : R221-1 et son annexe).
 */
export default async function SalesTermsPage() {
  const plans = (await getPublicPlans()).filter((p) => p.price_cents > 0);
  return (
    <LegalPage title="Conditions générales de vente">
      <section>
        <h2>1. Vendeur et objet</h2>
        <p>
          Les présentes conditions générales de vente (CGV) s&apos;appliquent aux abonnements payants du service {LEGAL.tradeName}
          , vendus sur le site clipera.fr par <strong><Value v={LEGAL.publisherName} /></strong>, <Value v={LEGAL.legalForm} />,
          domicilié au <Value v={LEGAL.address} />
          {LEGAL.siret ? <>, SIRET {LEGAL.siret}</> : <>, non immatriculé au registre des entreprises à ce jour</>}. Contact :{" "}
          <Value v={LEGAL.contactEmail} />.
        </p>
        <p>
          Clipera est un logiciel en ligne qui transforme des vidéos longues en clips courts (sélection des passages,
          recadrage, sous-titres). L&apos;utilisation du service est également encadrée par les{" "}
          <a href="/cgu">conditions générales d&apos;utilisation</a> et la <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>2. Offres et prix</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises (TTC). Le contenu de chaque offre (nombre de vidéos et de
          minutes par mois, durée maximale d&apos;une vidéo, qualité d&apos;export, filigrane) est décrit sur la page{" "}
          <a href="/tarifs">Tarifs</a>, puis rappelé sur le récapitulatif avant paiement.
        </p>
        {plans.length > 0 && (
          <ul>
            {plans.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> : {euros(p.price_cents)} par mois (mensuel), ou {euros(p.annual_price_cents)} par an
                (annuel, payé en une fois).
              </li>
            ))}
          </ul>
        )}
        <p>
          Une offre gratuite, sans moyen de paiement, permet d&apos;essayer le service avant tout achat. Pour un abonnement
          annuel, les quotas (vidéos et minutes) restent mensuels et se renouvellent chaque mois.
        </p>
      </section>

      <section>
        <h2>3. Commande et paiement</h2>
        <ul>
          <li>La commande se fait depuis un compte Clipera, en choisissant une offre et une périodicité (mensuelle ou annuelle).</li>
          <li>
            Avant de payer, un récapitulatif indique la formule, le montant débité le jour même, la période, la date et le prix du
            renouvellement. Le client accepte les présentes CGV en cochant la case prévue à cet effet.
          </li>
          <li>
            Le paiement s&apos;effectue par carte bancaire sur la page sécurisée de notre prestataire Stripe. Clipera n&apos;a
            jamais accès aux numéros de carte. Le montant est débité au moment de la commande, puis à chaque renouvellement.
          </li>
          <li>Les factures sont disponibles à tout moment dans l&apos;espace client (Abonnement → Gérer mon abonnement).</li>
        </ul>
      </section>

      <section>
        <h2>4. Durée, renouvellement et résiliation</h2>
        <ul>
          <li>
            L&apos;abonnement est conclu pour un mois (mensuel) ou douze mois (annuel), puis <strong>renouvelé
            automatiquement</strong> pour la même durée et au même prix, sauf résiliation.
          </li>
          <li>
            Le client peut <strong>résilier à tout moment</strong> depuis son espace (Abonnement → Gérer mon abonnement). La
            résiliation prend effet à la fin de la période déjà payée : l&apos;accès reste ouvert jusque-là et aucun nouveau
            prélèvement n&apos;a lieu. Hors droit de rétractation (article 5), la période commencée n&apos;est pas remboursée.
          </li>
          <li>
            Changement d&apos;offre : possible à tout moment depuis l&apos;espace client. La différence de prix est calculée au
            prorata du temps restant et apparaît sur la facture suivante.
          </li>
          <li>
            Paiement refusé : Stripe tente à nouveau le prélèvement pendant quelques jours. Sans paiement, l&apos;abonnement est
            arrêté et le compte revient à l&apos;offre gratuite. Aucune donnée n&apos;est supprimée de ce seul fait.
          </li>
          <li>
            Changement de prix : tout changement de prix est annoncé par e-mail au moins 30 jours avant de s&apos;appliquer au
            renouvellement suivant ; le client peut résilier avant cette date.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Droit de rétractation (14 jours)</h2>
        <p>
          Le client consommateur dispose d&apos;un délai de <strong>14 jours</strong> à compter de la souscription pour se rétracter,
          sans avoir à donner de motif (article L221-18 du Code de la consommation).
        </p>
        <p>
          Le service étant accessible immédiatement, le client demande expressément, en cochant la case prévue avant le paiement,
          que l&apos;abonnement commence avant la fin de ce délai. S&apos;il se rétracte ensuite, il est remboursé de la somme
          payée, déduction faite d&apos;un montant proportionnel au service fourni jusqu&apos;à la rétractation (article L221-25).
          Ce montant est calculé au prorata du nombre de jours écoulés sur la période payée.
        </p>
        <p>
          Pour se rétracter, il suffit d&apos;envoyer une déclaration claire (par exemple le formulaire ci-dessous) à{" "}
          <Value v={LEGAL.contactEmail} />. Le remboursement est effectué dans les 14 jours suivant la réception de la
          demande, sur le moyen de paiement utilisé lors de la commande.
        </p>
        <p>
          <strong>Modèle de formulaire de rétractation</strong> (à compléter et renvoyer uniquement si vous souhaitez vous
          rétracter) :
        </p>
        <p>
          À l&apos;attention de <Value v={LEGAL.publisherName} />, <Value v={LEGAL.address} />, <Value v={LEGAL.contactEmail} /> :
          <br />
          Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de services ci-dessous :
          abonnement Clipera (offre : …………). Souscrit le : ………… Nom du client : ………… Adresse e-mail du compte : …………
          Adresse du client : ………… Date : ………… Signature (uniquement en cas de notification sur papier).
        </p>
      </section>

      <section id="parrainage">
        <h2>6. Parrainage</h2>
        <ul>
          <li>
            Chaque client dispose d&apos;un lien de parrainage personnel (page Parrainage de son espace). Un nouvel
            utilisateur qui crée son compte avec ce lien, dans les 30 jours suivant le clic, devient son filleul. Un compte
            ne peut avoir qu&apos;un seul parrain, et se parrainer soi-même est impossible.
          </li>
          <li>
            Le filleul bénéficie de <strong>50 % de réduction sur son premier mois</strong> d&apos;abonnement mensuel. La
            réduction ne s&apos;applique pas aux abonnements annuels.
          </li>
          <li>
            Dès que le filleul a réellement payé une première facture, le parrain reçoit un <strong>crédit égal à un mois
            de son offre</strong> (un mois de l&apos;offre Starter s&apos;il est en offre gratuite). Ce crédit est déduit
            automatiquement de ses prochaines factures ; il n&apos;est ni remboursable ni convertible en argent.
          </li>
          <li>
            Un parrain peut recevoir au maximum 12 mois offerts sur 12 mois glissants. En cas d&apos;abus (faux comptes,
            fraude), les crédits concernés peuvent être annulés.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Exécution du service et responsabilité</h2>
        <p>
          Clipera fournit les clips en fonction du contenu des vidéos importées ; les notes affichées sont indicatives et aucun
          résultat (vues, abonnés, revenus) n&apos;est garanti. Un traitement qui échoue sans produire de clip ne consomme pas
          de quota. En cas d&apos;interruption prolongée du service imputable à l&apos;éditeur, le client peut demander un
          dédommagement au prorata de la durée d&apos;indisponibilité. Les autres règles d&apos;utilisation figurent dans les{" "}
          <a href="/cgu">CGU</a>.
        </p>
      </section>

      <section>
        <h2>8. Réclamations et médiation</h2>
        <p>
          Toute réclamation peut être adressée à <Value v={LEGAL.contactEmail} />. Nous répondons dans les meilleurs délais.
        </p>
        <p>
          En cas de litige non résolu, le client consommateur peut recourir gratuitement au médiateur de la consommation :{" "}
          <Value v={LEGAL.consumerMediator} />.
        </p>
      </section>

      <section>
        <h2>9. Données personnelles et droit applicable</h2>
        <p>
          Les données nécessaires à la commande (identité, adresse e-mail, informations de facturation) sont traitées comme
          décrit dans la <a href="/confidentialite">politique de confidentialité</a>. Les présentes CGV sont soumises au droit
          français. Version du {CGV_VERSION.split("-").reverse().join("/")}.
        </p>
      </section>
    </LegalPage>
  );
}
