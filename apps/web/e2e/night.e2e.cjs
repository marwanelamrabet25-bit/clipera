/** Mission qualité : tableau de bord, liens de clips permanents et sécurisés, bibliothèque, guide de démarrage. */
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");
const B = process.env.E2E_BASE_URL ?? "http://localhost:3100", PW = process.env.E2E_PASSWORD;
const CLIP = "e2e00000-0000-4000-8000-0000000000a9";
const res = [];
async function step(n, f) { try { await f(); res.push("✓ " + n); } catch (e) { res.push("✗ " + n + " | " + e.message.split("\n")[0]); } }
async function login(ctx, email) {
  const p = await ctx.newPage();
  await p.goto(B + "/connexion");
  await p.getByLabel("Adresse e-mail").first().fill(email);
  await p.getByLabel("Mot de passe").fill(PW);
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForURL(/\/app$/, { timeout: 20000 });
  return p;
}
(async () => {
  const b = await chromium.launch();
  const cA = await b.newContext(), cB = await b.newContext(), anon = await b.newContext();
  const a = await login(cA, "e2e-nuit-a@clipera.test");
  await step("Tableau de bord : derniers clips affichés (miniature servie par l'API)", async () => {
    const imgs = a.getByTestId("recent-clips").locator("img");
    await imgs.first().waitFor();
    assert.equal(await imgs.count(), 1);
    assert.match(await imgs.first().getAttribute("src"), /r2\.cloudflarestorage\.com.*X-Amz-Expires=43200/);
  });
  await step("Tableau de bord : projet récent cliquable", async () => {
    await a.getByRole("link", { name: /Podcast test nuit/ }).first().click();
    await a.waitForURL(/\/app\/projets\/e2e00000-0000-4000-8000-0000000000d7$/);
  });
  await step("Guide de démarrage masqué quand des clips existent", async () => {
    await a.goto(B + "/app");
    assert.equal(await a.getByText("Bien démarrer avec Clipera").count(), 0);
  });
  await step("Page projet : aperçu et téléchargement par liens directs valables 12 h", async () => {
    await a.goto(B + "/app/projets/e2e00000-0000-4000-8000-0000000000d7");
    // Liens directs vers le stockage (le lecteur vidéo de l'iPhone n'envoie pas toujours les cookies de session).
    assert.match(await a.locator("video").first().getAttribute("src"), /r2\.cloudflarestorage\.com.*X-Amz-Expires=43200/);
    assert.match(await a.getByRole("link", { name: /Télécharger le MP4/ }).getAttribute("href"), /response-content-disposition=attachment/);
  });
  await step("Propriétaire : lien signé tout neuf (téléchargement nommé)", async () => {
    const r = await a.request.get(`${B}/api/clips/${CLIP}/download`, { maxRedirects: 0 });
    assert.equal(r.status(), 302);
    const loc = r.headers()["location"];
    assert.ok(loc.includes("r2.cloudflarestorage.com") && loc.includes("X-Amz-Signature") && loc.includes("response-content-disposition"), loc.slice(0, 80));
    assert.equal(r.headers()["cache-control"], "private, max-age=300");
  });
  await step("Visiteur non connecté : 401", async () => {
    const r = await anon.request.get(`${B}/api/clips/${CLIP}/video`, { maxRedirects: 0 });
    assert.equal(r.status(), 401);
  });
  const bb = await login(cB, "e2e-nuit-b@clipera.test");
  await step("Autre utilisateur : 404 (aucun accès au clip d'autrui)", async () => {
    for (const k of ["video", "download", "thumbnail"]) {
      const r = await bb.request.get(`${B}/api/clips/${CLIP}/${k}`, { maxRedirects: 0 });
      assert.equal(r.status(), 404, k);
    }
    const r = await a.request.get(`${B}/api/clips/${CLIP}/autre`, { maxRedirects: 0 });
    assert.equal(r.status(), 404);
  });
  await step("Nouvel inscrit : guide de démarrage + bouton d'import", async () => {
    await bb.goto(B + "/app");
    await bb.getByText("Bien démarrer avec Clipera").waitFor();
    await bb.getByRole("link", { name: /Importer ma première vidéo/ }).click();
    await bb.waitForURL(/\/app\/nouveau$/);
  });
  await step("Bibliothèque : bouton de téléchargement direct", async () => {
    await a.goto(B + "/app/bibliotheque");
    assert.match(await a.getByRole("link", { name: /Télécharger « / }).getAttribute("href"), /response-content-disposition=attachment/);
  });
  await step("Mobile : tableau de bord et bibliothèque sans débordement", async () => {
    const m = await b.newContext({ ...devices["Pixel 7"], storageState: await cA.storageState() });
    const mp = await m.newPage();
    for (const u of ["/app", "/app/bibliotheque", "/app/projets/e2e00000-0000-4000-8000-0000000000d7"]) {
      await mp.goto(B + u);
      const [sw, vw] = await mp.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      assert.ok(sw <= vw, `${u} ${sw} > ${vw}`);
    }
    await mp.goto(B + "/app"); await mp.screenshot({ path: "/tmp/dash_mobile.png", fullPage: true });
  });
  await b.close();
  console.log(res.join("\n"));
  process.exit(res.some((r) => r.startsWith("✗")) ? 1 : 0);
})();
