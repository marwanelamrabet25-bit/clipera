/** Page d'accueil : structure, liens et appels à l'action, démonstration interactive, FAQ, mobile, animations réduites. */
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");
const B = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const res = [];
async function step(n, f) { try { await f(); res.push("✓ " + n); } catch (e) { res.push("✗ " + n + " | " + e.message.split("\n")[0]); } }

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(B + "/", { waitUntil: "networkidle" });

  await step("SEO : un seul H1, titre, description, canonique, données structurées (FAQ comprise)", async () => {
    assert.equal(await p.locator("h1").count(), 1);
    assert.match(await p.title(), /Clipera/);
    assert.ok((await p.locator('meta[name="description"]').getAttribute("content")).length > 80);
    // Adresse canonique = racine du site (https://clipera.fr en production, NEXT_PUBLIC_SITE_URL en local).
    assert.equal(new URL(await p.locator('link[rel="canonical"]').getAttribute("href")).pathname, "/");
    const ld = JSON.parse(await p.locator('script[type="application/ld+json"]').first().textContent());
    const types = ld["@graph"].map((n) => n["@type"]);
    for (const t of ["Organization", "WebSite", "SoftwareApplication", "FAQPage"]) assert.ok(types.includes(t), t);
  });
  await step("Tous les liens internes répondent (200)", async () => {
    const hrefs = [...new Set(await p.locator("a[href^='/']").evaluateAll((a) => a.map((x) => x.getAttribute("href").split("#")[0])))].filter(Boolean);
    for (const h of hrefs) {
      const r = await p.request.get(B + h, { maxRedirects: 0 });
      assert.ok([200, 307, 308].includes(r.status()), `${h} → ${r.status()}`);
    }
    assert.ok(hrefs.length >= 15, `${hrefs.length} liens`);
  });
  await step("Ancres de navigation : Fonctionnement, Le moteur, FAQ existent", async () => {
    for (const id of ["fonctionnement", "moteur", "fonctionnalites", "tarifs", "faq"]) assert.equal(await p.locator(`#${id}`).count(), 1, id);
    await p.getByRole("link", { name: "Le moteur" }).first().click();
    await p.waitForFunction(() => location.hash === "#moteur");
  });
  await step("Appel à l'action principal → inscription", async () => {
    await p.goto(B + "/");
    await p.getByRole("link", { name: /Essayer gratuitement/ }).nth(1).click();
    await p.waitForURL(/\/inscription/);
  });
  await step("Démonstration : changer le nombre de clips met à jour la frise et les clips", async () => {
    await p.goto(B + "/");
    const demo = p.getByRole("figure", { name: /Démonstration/ });
    await demo.getByRole("button", { name: "3", exact: true }).click();
    await demo.getByText("3 clips", { exact: false }).first().waitFor();
    assert.equal(await demo.locator("ol > li").count(), 3);
    await demo.getByRole("button", { name: "10", exact: true }).click();
    assert.equal(await demo.locator("ol > li").count(), 10);
    await demo.getByText("10/10 prêts").waitFor({ timeout: 8000 }); // montage simulé jusqu'au bout
    await demo.getByText(/Démonstration/).first().waitFor(); // toujours signalée comme démonstration
  });
  await step("FAQ : une question s'ouvre et montre sa réponse", async () => {
    const q = p.locator("details").filter({ hasText: "Combien de clips par vidéo" });
    await q.locator("summary").click();
    await q.getByText(/Jusqu'à 10 avec les offres payantes/).waitFor();
  });
  await step("Tarifs réels affichés (lus en base) avec 10 clips pour les offres payantes", async () => {
    await p.getByText("Jusqu'à 10 clips par vidéo").first().waitFor();
    await p.getByText("Jusqu'à 5 clips par vidéo").first().waitFor();
  });
  await step("Aucune erreur JavaScript", async () => assert.deepEqual(errors, []));

  await step("Mobile : pas de débordement, bouton « Essayer » dans l'en-tête, démo utilisable", async () => {
    const m = await b.newContext({ ...devices["iPhone 13"] });
    const mp = await m.newPage();
    await mp.goto(B + "/", { waitUntil: "networkidle" });
    const [vw, sw] = await mp.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]);
    assert.ok(vw === 390 && sw <= 390, `${vw}/${sw}`);
    await mp.getByRole("banner").getByRole("link", { name: "Essayer" }).waitFor();
    await mp.getByRole("button", { name: "5", exact: true }).first().tap();
    assert.equal(await mp.getByRole("figure", { name: /Démonstration/ }).locator("ol > li").count(), 5);
    await m.close();
  });
  await step("Animations réduites : tout le contenu est visible immédiatement", async () => {
    const r = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const rp = await r.newPage();
    await rp.goto(B + "/", { waitUntil: "networkidle" });
    assert.equal(await rp.locator("[data-reveal=hidden]").count(), 0);
    await rp.getByRole("figure", { name: /Démonstration/ }).getByText("10/10 prêts").waitFor({ timeout: 1000 });
    await r.close();
  });
  await step("Sans animations réduites : les sections apparaissent au défilement", async () => {
    await p.goto(B + "/", { waitUntil: "networkidle" });
    assert.ok((await p.locator("[data-reveal=hidden]").count()) > 0);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(800);
    await p.locator("#faq").scrollIntoViewIfNeeded();
    await p.waitForTimeout(800);
    assert.equal(await p.locator("#faq").evaluate((el) => getComputedStyle(el.closest("[data-reveal]") ?? el).opacity), "1");
  });
  console.log(res.join("\n"));
  console.log(`\n${res.filter((r) => r.startsWith("✓")).length}/${res.length} réussis`);
  await b.close();
  process.exit(res.some((r) => r.startsWith("✗")) ? 1 : 0);
})();
