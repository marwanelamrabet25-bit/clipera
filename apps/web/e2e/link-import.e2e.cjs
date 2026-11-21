/**
 * Import par lien (navigateur réel → action serveur → vraie base Supabase) : guides, messages d'aide, création
 * du projet et de l'import. Prérequis : application lancée (stockage configuré), compte E2E_A_EMAIL / PASSWORD.
 */
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");
const assert = require("node:assert/strict");
const fs = require("node:fs");
fs.readFileSync(`${__dirname}/../.env.local`, "utf8").split("\n").forEach((l) => {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
});
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const results = [];
async function step(name, fn) {
  try { await fn(); results.push(["✓", name]); } catch (e) { results.push(["✗", name, e.message.split("\n")[0]]); }
}

(async () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  await db.auth.signInWithPassword({ email: process.env.E2E_A_EMAIL, password: process.env.E2E_A_PASSWORD });
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BASE}/connexion`);
  await page.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
  await page.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/app$/, { timeout: 15000 });
  await page.goto(`${BASE}/app/nouveau`);
  const field = page.getByLabel("Lien Google Drive ou Dropbox");
  const button = page.getByRole("button", { name: "Importer depuis le lien" });

  await step("Guides : Drive, Dropbox, YouTube Studio, campagne de clipping", async () => {
    await page.getByText("Obtenir un lien Google Drive").click();
    await page.getByText("Tous les utilisateurs disposant du lien").first().waitFor();
    await page.getByText("Ma vidéo est sur YouTube").click();
    await page.getByText("studio.youtube.com").waitFor();
    await page.getByText("Je participe à une campagne de clipping").click();
    await page.getByText("Obtenir un lien Dropbox").waitFor();
  });

  await step("Lien de dossier Drive : explication et bouton bloqué", async () => {
    await field.fill("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz012345");
    await page.getByText("C'est le lien d'un dossier").waitFor();
    assert.equal(await button.isDisabled(), true);
  });

  await step("Lien YouTube : explication honnête + alternative (pas d'erreur sèche)", async () => {
    await field.fill("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
    await page.getByText("L'import direct depuis YouTube n'est pas encore disponible").waitFor();
    assert.equal(await button.isDisabled(), true);
  });

  await step("Autre site refusé", async () => {
    await field.fill("https://wetransfer.com/downloads/abc");
    await page.getByText("Colle un lien de partage Google Drive ou Dropbox.").waitFor();
  });

  await step("Droits obligatoires, puis import Drive : projet créé, suivi « Import en cours »", async () => {
    await field.fill("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing");
    assert.equal(await button.isDisabled(), true);
    await page.getByLabel(/Je suis le créateur de cette vidéo/).check();
    await button.click();
    await page.waitForURL(/\/app\/projets\/[0-9a-f-]{36}$/, { timeout: 15000 });
    await page.getByText("Import en cours").first().waitFor();
    const { data } = await db.from("processing_jobs").select("kind, status, options").eq("kind", "import_url");
    assert.equal(data.length, 1);
    assert.deepEqual(data[0].options, { url: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345", provider: "gdrive" });
  });

  await step("Mobile : pas de défilement horizontal", async () => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`${BASE}/app/nouveau`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `débordement ${overflow}px`);
  });

  await browser.close();
  for (const r of results) console.log(r.join(" "));
  process.exit(results.some((r) => r[0] === "✗") ? 1 : 0);
})();
