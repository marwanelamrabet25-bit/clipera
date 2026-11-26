import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

let assets: Promise<{ logo: string; fonts: { name: string; data: Buffer; weight: 500 | 700 | 800; style: "normal" }[] }> | null = null;

function loadAssets() {
  assets ??= (async () => {
    const root = process.cwd();
    const [logo, w500, w700, w800] = await Promise.all([
      readFile(join(root, "public/brand/logo-horizontal.png")),
      readFile(join(root, "src/fonts/og/manrope-latin-500-normal.woff")),
      readFile(join(root, "src/fonts/og/manrope-latin-700-normal.woff")),
      readFile(join(root, "src/fonts/og/manrope-latin-800-normal.woff")),
    ]);
    return {
      logo: `data:image/png;base64,${logo.toString("base64")}`,
      fonts: [
        { name: "Manrope", data: w500, weight: 500 as const, style: "normal" as const },
        { name: "Manrope", data: w700, weight: 700 as const, style: "normal" as const },
        { name: "Manrope", data: w800, weight: 800 as const, style: "normal" as const },
      ],
    };
  })();
  return assets;
}

/** Image de partage (Open Graph) aux couleurs de la marque. */
export async function ogImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const { logo, fonts } = await loadAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050608",
          padding: "64px 72px",
          fontFamily: "Manrope",
          position: "relative",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <radialGradient id="g" cx="0.85" cy="0.1" r="0.7">
              <stop offset="0" stopColor="#087BFF" stopOpacity="0.28" />
              <stop offset="1" stopColor="#087BFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="o" x1="0" x2="1">
              <stop offset="0" stopColor="#087BFF" stopOpacity="0" />
              <stop offset="0.6" stopColor="#087BFF" stopOpacity="0.8" />
              <stop offset="1" stopColor="#00A8FF" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#g)" />
          <path d="M520 600 C 760 640, 1100 520, 1180 300 C 1230 160, 1120 70, 980 60" fill="none" stroke="url(#o)" strokeWidth="2" />
        </svg>
        <img src={logo} width={318} height={47} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", color: "#B7C0CE", fontSize: 24, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>
            <div style={{ width: 10, height: 10, background: "#087BFF", marginRight: 16 }} />
            {eyebrow}
          </div>
          <div style={{ marginTop: 24, color: "#F7F9FC", fontSize: title.length > 48 ? 64 : 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 1000 }}>
            {title}
          </div>
          {subtitle && <div style={{ marginTop: 24, color: "#B7C0CE", fontSize: 28, fontWeight: 500, maxWidth: 900 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", color: "#B7C0CE", fontSize: 22, fontWeight: 500 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#087BFF", marginRight: 14 }} />
          Pierrefontaine-les-Varans · Doubs et communes environnantes
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
