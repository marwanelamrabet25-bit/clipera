import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/legal/site-footer";
import { buttonStyles } from "@/components/ui/button";

// Page d'attente honnête : la landing page complète arrive en Phase 2.
export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="grid flex-1 place-items-center px-4 py-16">
        <div className="max-w-3xl text-center">
          <Logo size={44} className="justify-center" />
          <h1 className="mt-10 text-h1 font-bold sm:text-display">
            Transforme tes vidéos.
            <br />
            <span className="text-primary-soft">Multiplie tes opportunités.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted">
            Clipera transforme tes vidéos longues en clips courts grâce à l&apos;intelligence artificielle.
            Le produit est en cours de construction.
          </p>
          <Link href="/connexion" className={buttonStyles({ size: "lg", className: "mt-8" })}>
            Se connecter
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
