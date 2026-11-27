import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { INDEXABLE, SITE_URL, brand } from "@/config/site";
import "./globals.css";

const manrope = localFont({
  src: "../fonts/Manrope-Variable-latin.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial"],
  adjustFontFallback: "Arial",
});

const geistMono = localFont({
  src: "../fonts/GeistMono-Variable-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${brand.name} — Agence web à Pierrefontaine-les-Varans, Doubs`,
    template: `%s · ${brand.shortName}`,
  },
  description: brand.description,
  applicationName: brand.name,
  authors: [{ name: brand.name }],
  creator: brand.name,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: { siteName: brand.name, locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: INDEXABLE ? { index: true, follow: true, "max-image-preview": "large" } : { index: false, follow: false },
  // Vérification Google Search Console / Bing Webmaster Tools (balise meta), si les codes sont fournis.
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

/** Marque le document comme « JS actif » avant l'affichage : les animations d'entrée ne masquent jamais le contenu sans JavaScript. */
const jsFlag = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${manrope.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
