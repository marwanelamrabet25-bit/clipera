import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Vidéos marketing : avec « ?telecharger », le navigateur (Safari iPhone compris) télécharge le fichier
  // au lieu de le lire dans son lecteur plein écran.
  async headers() {
    return [
      {
        source: "/media/:file*",
        has: [{ type: "query", key: "telecharger" }],
        headers: [
          { key: "Content-Disposition", value: 'attachment; filename="clipera-video.mp4"' },
          // Type générique : les navigateurs intégrés aux applications (qui lisent toute vidéo) téléchargent aussi.
          { key: "Content-Type", value: "application/octet-stream" },
        ],
      },
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
