/**
 * Contrôle qualité automatique : parcourt toutes les pages publiques et vérifie
 *  - statut HTTP, erreurs console, images cassées, débordement horizontal (mobile et desktop) ;
 *  - un seul H1, title et description uniques, canonical présent ;
 *  - liens internes valides.
 * Usage : BASE_URL=http://localhost:3000 node scripts/qa.mjs [--shots dossier]
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const shotsDir = process.argv.includes("--shots") ? process.argv[process.argv.indexOf("--shots") + 1] : null;
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
routes.push("/page-inexistante");

const browser = await chromium.launch();
const problems = [];
const seen = { titles: new Map(), descriptions: new Map() };
const links = new Set();

for (const width of [1440, 1024, 768, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width > 500 ? 900 : 844 } });
  for (const route of routes) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    const status = res?.status();
    if (route === "/page-inexistante" ? status !== 404 : status !== 200) problems.push(`${route} [${width}] statut ${status}`);
    // Défilement pour déclencher le chargement paresseux des images
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      badHrefs: [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter((h) => h === "#" || h === "" || /^javascript:/i.test(h) || /localhost|example\.com|exemple\.fr/.test(h) || (/^tel:/.test(h) && !/^tel:\+33\d{9}$/.test(h)) || (/^mailto:/.test(h) && !/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}/i.test(h))),
      emptyButtons: [...document.querySelectorAll("a, button")].filter((el) => !el.closest("[aria-hidden=true]") && !(el.textContent.trim() || el.getAttribute("aria-label") || el.querySelector("img[alt]:not([alt=''])"))).length,
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
        try { JSON.parse(s.textContent); return true; } catch { return false; }
      }),
    }));
    if (errors.length && route !== "/page-inexistante") problems.push(`${route} [${width}] console : ${errors.slice(0, 3).join(" | ")}`);
    if (info.overflow > 1) problems.push(`${route} [${width}] débordement horizontal de ${info.overflow}px`);
    if (info.broken.length) problems.push(`${route} [${width}] images cassées : ${info.broken.join(", ")}`);
    if (info.noAlt.length) problems.push(`${route} [${width}] images sans alt : ${info.noAlt.join(", ")}`);
    if (info.jsonld.includes(false)) problems.push(`${route} JSON-LD invalide`);
    if (info.badHrefs.length) problems.push(`${route} [${width}] liens suspects : ${info.badHrefs.join(", ")}`);
    if (info.emptyButtons) problems.push(`${route} [${width}] ${info.emptyButtons} lien(s)/bouton(s) sans libellé accessible`);
    if (width === 1440 && route !== "/page-inexistante") {
      if (info.h1 !== 1) problems.push(`${route} : ${info.h1} H1`);
      if (!info.canonical) problems.push(`${route} : canonical manquant`);
      if (!info.description) problems.push(`${route} : description manquante`);
      for (const [k, v] of [["titles", info.title], ["descriptions", info.description]]) {
        if (seen[k].has(v)) problems.push(`${route} : ${k === "titles" ? "title" : "description"} identique à ${seen[k].get(v)}`);
        seen[k].set(v, route);
      }
      if (info.title.length > 65) problems.push(`${route} : title long (${info.title.length}) « ${info.title} »`);
      if (info.description.length > 165) problems.push(`${route} : description longue (${info.description.length})`);
      info.links.filter((h) => h.startsWith("/") && !h.startsWith("//")).forEach((h) => links.add(h.split("#")[0] || "/"));
    }
    if (shotsDir) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const name = (route === "/" ? "accueil" : route.slice(1).replace(/\//g, "_")) + `-${width}.png`;
      await page.screenshot({ path: path.join(shotsDir, name), fullPage: true });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

for (const href of links) {
  const r = await fetch(BASE + href, { redirect: "manual" });
  if (r.status >= 400) problems.push(`Lien mort : ${href} (${r.status})`);
}

console.log(`${routes.length} pages × 4 largeurs, ${links.size} liens internes vérifiés.`);
console.log(problems.length ? `\n${problems.length} problème(s) :\n- ${problems.join("\n- ")}` : "\nAucun problème détecté.");
process.exit(problems.length ? 1 : 0);
