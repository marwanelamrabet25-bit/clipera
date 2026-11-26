import localFont from "next/font/local";

/** Polices des exemples de maquettes (entreprises fictives). Chargées seulement là où elles sont utilisées (pas de préchargement). */
export const fraunces = localFont({
  src: [
    { path: "../fonts/Fraunces-Variable-latin.woff2", style: "normal" },
    { path: "../fonts/Fraunces-Variable-Italic-latin.woff2", style: "italic" },
  ],
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const archivo = localFont({
  src: "../fonts/Archivo-Variable-latin.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  preload: false,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});
