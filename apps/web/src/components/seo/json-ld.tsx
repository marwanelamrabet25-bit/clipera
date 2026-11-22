/** Données structurées pour Google. Le « < » est échappé pour qu'aucun texte ne puisse fermer la balise script. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
