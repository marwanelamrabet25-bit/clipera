/**
 * Génère les visuels des exemples de maquettes (entreprises fictives) à partir des aperçus réels.
 * Usage : lancer le site (pnpm dev ou pnpm start), puis
 *   BASE_URL=http://localhost:3000 node scripts/capture-demos.cjs
 * Sortie : public/projects/<slug>/{desktop,mobile,full,social}.webp (via Python/Pillow si disponible, sinon PNG).
 */
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(__dirname, "..", "public", "projects");
/** Exemples de maquettes (entreprises fictives) et planches de publications. */
const slugs = ["oree", "atelier-sylve", "nacre"];
const social = ["oree", "la-meule"];

/** Masque le bandeau « démonstration » et l'indicateur de développement, attend les polices. */
async function prepare(page) {
  await page.addStyleTag({ content: "[data-demo-banner], nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function tiles(browser, url, dir, prefix, { width = 1600, height = 1000, dsf = 2 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await prepare(page);
  for (const el of await page.$$("[data-tile]")) {
    const name = await el.getAttribute("data-tile");
    await el.screenshot({ path: path.join(dir, `${prefix}${name}.png`) });
  }
  await ctx.close();
}

async function shot(browser, url, file, { width, height, dsf, fullPage = false }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await prepare(page);
  await page.screenshot({ path: file, fullPage });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const slug of slugs) {
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const url = `${BASE}/apercu/${slug}`;
    await shot(browser, url, path.join(dir, "desktop.png"), { width: 1440, height: 900, dsf: 1.5 });
    await shot(browser, url, path.join(dir, "mobile.png"), { width: 390, height: 844, dsf: 2 });
    await shot(browser, url, path.join(dir, "full.png"), { width: 1440, height: 900, dsf: 1, fullPage: true });
    console.log("✓", slug);
  }
  for (const slug of social) {
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    await shot(browser, `${BASE}/apercu/${slug}/reseaux`, path.join(dir, "social.png"), { width: 1200, height: 900, dsf: 1.5 });
    await tiles(browser, `${BASE}/apercu/${slug}/reseaux`, dir, "post-", { width: 1200, height: 900 });
    console.log("✓ publications", slug);
  }
  const fdir = path.join(OUT, "formats");
  fs.mkdirSync(fdir, { recursive: true });
  await tiles(browser, `${BASE}/apercu/formats`, fdir, "reel-");
  console.log("✓ formats");
  await browser.close();
  // Compression : PNG → PNG optimisé (palette conservée), Pillow si disponible.
  try {
    execFileSync("python3", ["-I", path.join(__dirname, "optimize-images.py"), OUT], { stdio: "inherit" });
  } catch {
    console.warn("Optimisation Pillow indisponible : images PNG conservées telles quelles.");
  }
})();
