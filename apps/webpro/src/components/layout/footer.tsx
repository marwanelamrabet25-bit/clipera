import Image from "next/image";
import Link from "next/link";
import { activeSocials, brand, contact, COPYRIGHT_YEAR, location, serviceArea } from "@/config/site";
import { services } from "@/config/services";
import { legalNav } from "@/config/navigation";

const navCols = [
  { label: "Accueil", href: "/" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Maquette gratuite", href: "/maquette-gratuite" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
  { label: "Conseils", href: "/blog" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Informations sur {brand.name}
      </h2>
      <div className="shell pt-20 pb-10 md:pt-24">
        <div className="grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-5">
            <Image
              src={brand.logo.stacked.src}
              width={brand.logo.stacked.width}
              height={brand.logo.stacked.height}
              alt={brand.name}
              sizes="240px"
              quality={90}
              className="h-auto w-[13.5rem]"
            />
            <p className="mt-8 max-w-[22ch] text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.03em] text-paper">
              {brand.tagline}
            </p>
            <p className="mt-5 max-w-[42ch] text-[0.95rem] text-mist">{serviceArea.sentence}</p>
          </div>

          <nav aria-label="Plan du site" className="col-span-2 md:col-span-2">
            <p className="t-label mb-5 text-slate">Navigation</p>
            <ul className="space-y-2.5 text-[0.95rem]">
              {navCols.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-mist transition-colors hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Prestations" className="col-span-2 md:col-span-2">
            <p className="t-label mb-5 text-slate">Prestations</p>
            <ul className="space-y-2.5 text-[0.95rem]">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className="link-underline text-mist transition-colors hover:text-paper">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-4 md:col-span-3">
            <p className="t-label mb-5 text-slate">Contact</p>
            <address className="space-y-2.5 text-[0.95rem] not-italic">
              <a href={`tel:${contact.phoneE164}`} className="block text-paper transition-colors hover:text-glow">
                {contact.phoneDisplay}
              </a>
              <a href={`mailto:${contact.email}`} className="block break-all text-paper transition-colors hover:text-glow">
                {contact.email}
              </a>
              <p className="pt-2 text-mist">
                {location.locality}
                <br />
                {location.department} ({location.departmentCode}), {location.region}
                <br />
                {location.country}
              </p>
            </address>
            {activeSocials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
                {activeSocials.map((s) => (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline text-mist hover:text-paper">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-sm text-slate md:flex-row md:items-center md:justify-between">
          <p>
            © {COPYRIGHT_YEAR} {brand.name} · Agence digitale à {location.locality}, {location.department}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline transition-colors hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
