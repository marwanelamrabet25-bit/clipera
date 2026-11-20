/**
 * Suppression de compte de bout en bout : un utilisateur importe une vidéo (stockage S3 de test), puis supprime
 * son compte depuis Paramètres. Vérifie que les fichiers ET la session disparaissent.
 * Prérequis : comme upload.e2e.cjs (S3_ENDPOINT, E2E_A_EMAIL / E2E_A_PASSWORD, E2E_VIDEO).
 * La vérification que les lignes en base ont disparu est faite en SQL après le test (voir docs/TESTING.md).
 */
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const assert = require("node:assert/strict");
const fs = require("node:fs");
fs.readFileSync(`${__dirname}/../.env.local`, "utf8")
  .split("\n")
  .forEach((l) => {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["✓", name]);
  } catch (e) {
    results.push(["✗", name, e.message.split("\n")[0]]);
  }
}

(async () => {
  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: login } = await db.auth.signInWithPassword({
    email: process.env.E2E_A_EMAIL,
    password: process.env.E2E_A_PASSWORD,
  });
  const uid = login.user.id;
  const count = async () =>
    (await s3.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, Prefix: `sources/${uid}/` }))).KeyCount ?? 0;

  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BASE}/connexion`);
  await page.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
  await page.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/app$/, { timeout: 15000 });

  await step("Préparation : une vidéo importée est bien dans le stockage", async () => {
    await page.goto(`${BASE}/app/nouveau`);
    await page.getByTestId("file-input").setInputFiles(process.env.E2E_VIDEO);
    await page.getByLabel(/Je confirme détenir les droits/).check();
    await page.getByRole("button", { name: "Importer la vidéo" }).click();
    await page.waitForURL(/\/app\/projets\/[0-9a-f-]{36}$/, { timeout: 120000 });
    assert.equal(await count(), 1);
  });

  await step("Le bouton final reste bloqué tant que SUPPRIMER n'est pas tapé", async () => {
    await page.goto(`${BASE}/app/parametres`);
    await page.getByRole("button", { name: "Supprimer mon compte" }).click();
    await page.getByLabel(/Pour confirmer, tape SUPPRIMER/).fill("supprimer");
    assert.equal(await page.getByRole("button", { name: "Supprimer définitivement" }).isDisabled(), true);
  });

  await step("L'API refuse sans le mot de confirmation exact", async () => {
    const r = await page.request.post(`${BASE}/api/account/delete`, { data: { confirmation: "oui" } });
    assert.equal(r.status(), 400);
    assert.equal(await count(), 1);
  });

  await step("Suppression : fichiers effacés, retour à la connexion avec confirmation", async () => {
    await page.getByLabel(/Pour confirmer, tape SUPPRIMER/).fill("SUPPRIMER");
    await page.getByRole("button", { name: "Supprimer définitivement" }).click();
    await page.waitForURL(/\/connexion\?compte=supprime/, { timeout: 30000 });
    await page.getByText("Ton compte a été supprimé").waitFor();
    assert.equal(await count(), 0);
  });

  await step("La session est fermée et l'ancien mot de passe ne fonctionne plus", async () => {
    await page.goto(`${BASE}/app`);
    assert.equal(new URL(page.url()).pathname, "/connexion");
    const { error } = await db.auth.signInWithPassword({
      email: process.env.E2E_A_EMAIL,
      password: process.env.E2E_A_PASSWORD,
    });
    assert.ok(error, "la connexion aurait dû échouer");
  });

  await browser.close();
  for (const r of results) console.log(r.join("  "));
  const failed = results.filter((r) => r[0] === "✗").length;
  console.log(`\n${results.length - failed}/${results.length} réussis`);
  process.exit(failed ? 1 : 0);
})();
