import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { contact, location, serviceArea } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact et devis — agence web dans le Doubs",
  description:
    "Un projet de site internet, de réseaux sociaux ou de vidéo ? Contactez WEBPRO AGENCY à Pierrefontaine-les-Varans au 07 68 35 50 56.",
  path: "/contact",
});

const next = [
  { t: "Nous lisons votre message", d: "Pour comprendre votre activité et votre besoin." },
  { t: "Nous échangeons", d: "Par téléphone ou par email, pour préciser le projet." },
  { t: "Vous recevez une proposition", d: "Un devis détaillé, adapté à ce dont vous avez réellement besoin." },
];

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="Contact & devis"
        title={["Parlons de", { text: "votre projet.", className: "text-electric" }]}
        lead={
          <p>
            Décrivez votre activité et ce que vous souhaitez créer ou améliorer : nous revenons vers vous pour en discuter. Vous
            préférez le téléphone ? Appelez directement.
          </p>
        }
        className="!pb-12 md:!pb-16"
      />

      <section aria-label="Formulaire et coordonnées" className="shell grid-12 gap-y-16 pb-28 md:pb-40">
        <div className="col-span-4 md:col-span-12 lg:col-span-7">
          <div className="enter" style={{ "--d": 500 } as CSSProperties}>
            <ContactForm />
          </div>
        </div>

        <aside className="col-span-4 md:col-span-12 lg:col-span-4 lg:col-start-9" aria-label="Coordonnées">
          <div className="space-y-px overflow-hidden rounded-[6px] border border-line bg-line lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <a href={`tel:${contact.phoneE164}`} className="group flex items-start gap-4 bg-ink-2 p-6 transition-colors hover:bg-ink-3">
              <Phone className="mt-1 size-5 shrink-0 text-electric" aria-hidden />
              <span>
                <span className="t-label block text-slate">Téléphone</span>
                <span className="mt-2 block text-[1.4rem] font-bold tracking-[-0.02em] text-paper group-hover:text-glow">{contact.phoneDisplay}</span>
              </span>
            </a>
            <a href={`mailto:${contact.email}`} className="group flex items-start gap-4 bg-ink-2 p-6 transition-colors hover:bg-ink-3">
              <Mail className="mt-1 size-5 shrink-0 text-electric" aria-hidden />
              <span className="min-w-0">
                <span className="t-label block text-slate">Email</span>
                <span className="mt-2 block text-[1.05rem] font-semibold break-all text-paper group-hover:text-glow">{contact.email}</span>
              </span>
            </a>
            <div className="flex items-start gap-4 bg-ink-2 p-6">
              <MapPin className="mt-1 size-5 shrink-0 text-electric" aria-hidden />
              <span>
                <span className="t-label block text-slate">Localisation</span>
                <span className="mt-2 block font-semibold text-paper">
                  {location.locality}, {location.department} ({location.departmentCode})
                </span>
                <span className="mt-1 block text-sm text-mist">{serviceArea.sentence}</span>
              </span>
            </div>
            <div className="bg-ink-2 p-6">
              <p className="t-label text-slate">Et ensuite ?</p>
              <ol className="mt-5 space-y-5">
                {next.map((s, i) => (
                  <li key={s.t} className="grid grid-cols-[2rem_1fr]">
                    <span className="font-mono text-sm text-electric">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold text-paper">{s.t}</span>
                      <span className="block text-sm text-mist">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
