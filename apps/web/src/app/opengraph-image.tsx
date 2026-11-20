import { ImageResponse } from "next/og";

export const alt = "Clipera — Transforme tes vidéos. Multiplie tes opportunités.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image d'aperçu partagée sur les réseaux (aux couleurs officielles). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0B0B10",
          color: "#F8F9FF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#A78BFA" }}>Clipera</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, fontSize: 76, fontWeight: 700, lineHeight: 1.08 }}>
          <span>Transforme tes vidéos.</span>
          <span style={{ color: "#A78BFA" }}>Multiplie tes opportunités.</span>
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 30, color: "#A3A3B8" }}>
          Des clips courts, naturels et prêts à publier, à partir de tes vidéos longues.
        </div>
      </div>
    ),
    size,
  );
}
