import { archivo, fraunces } from "@/lib/demo-fonts";

/** Gabarit des exemples de maquettes (entreprises fictives) : sans l'en-tête de l'agence. */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} ${archivo.variable}`}>{children}</div>;
}
