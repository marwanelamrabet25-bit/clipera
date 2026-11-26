import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-[3px] bg-paper px-4 py-3 font-semibold text-ink transition-transform focus:translate-y-0"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <RevealObserver />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </>
  );
}
