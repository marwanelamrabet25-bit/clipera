import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Variantes d'URL fréquentes → pages officielles (redirections permanentes).
  async redirects() {
    return [
      { source: "/services", destination: "/#expertises", permanent: false },
      // Contenus vidéo : intégrés à la gestion des réseaux sociaux.
      { source: "/creation-contenu", destination: "/gestion-reseaux-sociaux#videos", permanent: true },
      { source: "/creation-de-contenu", destination: "/gestion-reseaux-sociaux#videos", permanent: true },
      // Pas de page réalisations tant qu'il n'y a pas de projets clients réels (redirection temporaire).
      { source: "/realisations", destination: "/maquette-gratuite", permanent: false },
      { source: "/realisations/:slug*", destination: "/maquette-gratuite", permanent: false },
      { source: "/realisation", destination: "/maquette-gratuite", permanent: false },
      { source: "/portfolio", destination: "/maquette-gratuite", permanent: false },
      { source: "/maquette", destination: "/maquette-gratuite", permanent: true },
      { source: "/prix", destination: "/tarifs", permanent: true },
      { source: "/offres", destination: "/tarifs", permanent: true },
      { source: "/creation-site-internet", destination: "/creation-site-web", permanent: true },
      { source: "/reseaux-sociaux", destination: "/gestion-reseaux-sociaux", permanent: true },
      { source: "/agence", destination: "/a-propos", permanent: true },
      { source: "/devis", destination: "/contact", permanent: true },
      { source: "/contactez-nous", destination: "/contact", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
