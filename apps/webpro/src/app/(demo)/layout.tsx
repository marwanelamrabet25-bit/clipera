import { archivo, fraunces } from "@/lib/demo-fonts";

/** Gabarit des aperçus de projets de démonstration : sans l'en-tête de l'agence. */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} ${archivo.variable}`}>{children}</div>;
}
