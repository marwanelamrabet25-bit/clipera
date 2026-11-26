import type { MetadataRoute } from "next";
import { brand } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: "WebPro",
    description: brand.description,
    lang: "fr-FR",
    start_url: "/",
    display: "browser",
    background_color: "#050608",
    theme_color: "#050608",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
