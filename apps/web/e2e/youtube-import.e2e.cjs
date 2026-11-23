/**
 * Import YouTube (navigateur réel → API → vrai YouTube pour les infos publiques → vraie base Supabase → faux S3).
 * Prérequis : application lancée sur E2E_BASE_URL avec un faux S3 (S3_ENDPOINT, moto), compte E2E_EMAIL / E2E_PASSWORD,
 * E2E_VIDEO (petite vidéo MP4).
 * Sépare clairement : (1) infos publiques de la vidéo (oEmbed, réel) et (2) récupération du fichier, qui passe par
 * l'envoi du fichier original par l'utilisateur. Aucun téléchargement depuis YouTube n'est tenté.
 */
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");
const B = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const REAL = "jNQXAC9IVRw"; // « Me at the zoo », vidéo publique
const res = [];
async function step(n, f) { try { await f(); res.push("✓ " + n); } catch (e) { res.push("✗ " + n + " | " + e.message.split("\n")[0]); } }

async function login(ctx) {
  const p = await ctx.newPage();
  await p.goto(B + "/connexion");
  await p.getByLabel("Adresse e-mail").first().fill(process.env.E2E_EMAIL);
  await p.getByLabel("Mot de passe").fill(process.env.E2E_PASSWORD);
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForURL(/\/app$/, { timeout: 20000 });
  return p;
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext();
  const p = await login(ctx);
  await p.goto(B + "/app/nouveau");
  const box = p.getByTestId("youtube-import");
  const input = p.getByPlaceholder("https://www.youtube.com/watch?v=…");
  const go = p.getByRole("button", { name: "Générer mes clips" });

  await step("Onglet YouTube ouvert par défaut, textes demandés", async () => {
    await box.waitFor();
    assert.equal(await p.getByRole("tab", { name: "YouTube" }).getAttribute("aria-selected"), "true");
    assert.ok(await box.getByText("Transforme une vidéo YouTube en clips").isVisible());
    assert.ok(await box.getByText("Colle le lien de ta vidéo et laisse CLIPERA faire le travail.").isVisible());
    assert.ok(await go.isDisabled());
  });
  await step("Lien incorrect : message immédiat, bouton désactivé", async () => {
    await input.fill("https://vimeo.com/123456");
    await box.getByText("Ce n'est pas un lien YouTube").waitFor();
    assert.ok(await go.isDisabled());
    await input.fill("https://www.youtube.com/playlist?list=PL123");
    await box.getByText("C'est le lien d'une playlist").waitFor();
    await input.fill("https://www.youtube.com/@clipera");
    await box.getByText("C'est le lien d'une chaîne").waitFor();
  });
  await step("Vidéo supprimée / inexistante (vrai YouTube) : « introuvable »", async () => {
    await input.fill("https://youtu.be/aaaaaaaaaaa");
    await go.click();
    await box.getByText(/Vidéo introuvable/).waitFor({ timeout: 15000 });
    assert.equal(await box.getByRole("button", { name: "Réessayer" }).count(), 0);
  });
  await step("Erreur réseau : message + « Réessayer » qui fonctionne", async () => {
    await p.route("**/api/youtube/lookup", (r) => r.abort("internetdisconnected"));
    await input.fill(`https://www.youtube.com/watch?v=${REAL}&t=10s`);
    await go.click();
    await box.getByText(/Connexion interrompue/).waitFor();
    await p.unroute("**/api/youtube/lookup");
    await box.getByRole("button", { name: "Réessayer" }).click();
    await box.getByTestId("youtube-title").waitFor({ timeout: 15000 });
  });
  await step("Vidéo publique (vrai YouTube) : titre, chaîne, miniature, étape 1/3", async () => {
    assert.equal(await box.getByTestId("youtube-title").textContent(), "Me at the zoo");
    assert.ok(await box.getByText("jawed").isVisible());
    const img = box.locator("img").first();
    await p.waitForFunction((el) => el.complete && el.naturalWidth > 0, await img.elementHandle(), { timeout: 15000 });
    assert.equal(await p.getByRole("progressbar").first().getAttribute("aria-valuenow"), "1");
  });
  await step("« Un autre créateur » : lien Drive/Dropbox proposé, lien YouTube redirigé", async () => {
    await box.getByRole("button", { name: /Un autre créateur/ }).click();
    const other = box.getByTestId("youtube-other");
    await other.getByLabel("Lien Google Drive ou Dropbox").fill(`https://youtu.be/${REAL}`);
    await other.getByText("C'est un lien YouTube").waitFor();
    assert.ok(await other.getByRole("button", { name: "Importer depuis le lien" }).isDisabled());
  });
  await step("« Ma chaîne » : lien direct vers la vidéo dans YouTube Studio (nouvel onglet), étape 2/3", async () => {
    await box.getByRole("button", { name: /Moi, c'est ma chaîne/ }).click();
    const own = box.getByTestId("youtube-owner");
    const studio = own.getByRole("link", { name: /Ouvrir dans YouTube Studio/ });
    assert.equal(await studio.getAttribute("href"), `https://studio.youtube.com/video/${REAL}/edit`);
    assert.equal(await studio.getAttribute("target"), "_blank");
    assert.match(await studio.getAttribute("rel"), /noopener/);
    assert.equal(await p.getByRole("progressbar").first().getAttribute("aria-valuenow"), "2");
  });
  let projectUrl = "";
  await step("Fichier original envoyé → projet créé avec le titre YouTube (vraie base, fichier stocké)", async () => {
    const own = box.getByTestId("youtube-owner");
    await own.getByTestId("file-input").setInputFiles(process.env.E2E_VIDEO);
    await own.getByRole("checkbox").check();
    await own.getByRole("button", { name: "Envoyer et créer mes clips" }).click();
    await p.waitForURL(/\/app\/projets\/[0-9a-f-]{36}$/, { timeout: 60000 });
    projectUrl = p.url();
    await p.getByRole("heading", { name: "Me at the zoo" }).first().waitFor({ timeout: 15000 });
  });
  await step("Vidéo privée (réponse simulée) : avertissement, parcours propriétaire toujours possible", async () => {
    await p.goto(B + "/app/nouveau");
    await p.route("**/api/youtube/lookup", (r) =>
      r.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ error: { code: "video_private", message: "x" } }) }));
    await input.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await go.click();
    await box.getByText("Vidéo privée ou non intégrable").waitFor();
    await box.getByRole("button", { name: /Moi, c'est ma chaîne/ }).click();
    assert.equal(await box.getByRole("link", { name: /Ouvrir dans YouTube Studio/ }).getAttribute("href"),
      "https://studio.youtube.com/video/dQw4w9WgXcQ/edit");
    await p.unroute("**/api/youtube/lookup");
  });
  await step("YouTube indisponible (réponse simulée 502) : message + Réessayer", async () => {
    await p.goto(B + "/app/nouveau");
    await p.route("**/api/youtube/lookup", (r) =>
      r.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: { code: "youtube_unreachable", message: "YouTube ne répond pas pour le moment. Réessaie dans un instant." } }) }));
    await input.fill(`https://youtu.be/${REAL}`);
    await go.click();
    await box.getByText("YouTube ne répond pas").waitFor();
    assert.equal(await box.getByRole("button", { name: "Réessayer" }).count(), 1);
    await p.unroute("**/api/youtube/lookup");
  });
  await step("API : liens dangereux refusés sans appel réseau (SSRF)", async () => {
    for (const url of ["http://169.254.169.254/latest/meta-data", "https://evil.com/watch?v=" + REAL,
      `https://www.youtube.com/watch?v=${REAL}@evil.com`, "file:///etc/passwd", "x".repeat(5000)]) {
      const r = await p.request.post(B + "/api/youtube/lookup", { data: { url } });
      assert.equal(r.status(), 400, url.slice(0, 40));
    }
  });
  await step("API : visiteur non connecté → 401", async () => {
    const anon = await b.newContext();
    const r = await anon.request.post(B + "/api/youtube/lookup", { data: { url: `https://youtu.be/${REAL}` } });
    assert.equal(r.status(), 401);
    await anon.close();
  });
  await step("Mobile : pas de défilement horizontal, champ et bouton visibles", async () => {
    const m = await b.newContext({ ...devices["iPhone 13"] });
    await m.addCookies(await ctx.cookies());
    const mp = await m.newPage();
    await mp.goto(B + "/app/nouveau");
    await mp.getByTestId("youtube-import").waitFor();
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(over <= 0, `débordement ${over}px`);
    await mp.getByPlaceholder("https://www.youtube.com/watch?v=…").fill(`https://youtu.be/${REAL}`);
    await mp.getByRole("button", { name: "Générer mes clips" }).click();
    await mp.getByTestId("youtube-title").waitFor({ timeout: 15000 });
    await mp.screenshot({ path: process.env.E2E_SHOT ?? "/tmp/youtube-mobile.png", fullPage: true });
    await m.close();
  });
  console.log(res.join("\n"));
  console.log(`\n${res.filter((r) => r.startsWith("✓")).length}/${res.length} réussis · projet : ${projectUrl}`);
  await b.close();
  process.exit(res.some((r) => r.startsWith("✗")) ? 1 : 0);
})();
