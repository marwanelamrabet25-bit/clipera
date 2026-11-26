/**
 * Capture rapide d'une page pour l'inspection visuelle.
 * Usage : node scripts/shot.cjs <url> <fichier.png> [largeur] [hauteur] [full]
 */
const { chromium } = require("playwright");
(async () => {
  const [url, file, w = "1440", h = "900", full] = process.argv.slice(2);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  if (full) {
    // Fait défiler pour déclencher les révélations, puis revient en haut.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
  }
  await page.waitForTimeout(2200);
  await page.screenshot({ path: file, fullPage: Boolean(full) });
  if (errors.length) console.log("ERREURS CONSOLE:\n" + errors.join("\n"));
  await browser.close();
})();
