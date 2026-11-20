/**
 * Test de bout en bout de l'import : navigateur → API → stockage S3 (multipart) → base Supabase.
 *
 * Prérequis : application lancée avec un stockage S3 de test (S3_ENDPOINT, ex. moto) et un compte de test
 * (E2E_A_EMAIL / E2E_A_PASSWORD). E2E_VIDEO : vidéo valide de plus de 32 Mo (≥ 3 morceaux de 16 Mio).
 */
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");
const { S3Client, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
fs.readFileSync(`${__dirname}/../.env.local`, "utf8")
  .split("\n")
  .forEach((l) => {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const VIDEO = process.env.E2E_VIDEO;
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["✓", name]);
  } catch (e) {
    results.push(["✗", name, e.message.split("\n")[0]]);
  }
}
const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");

(async () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  await db.auth.signInWithPassword({ email: process.env.E2E_A_EMAIL, password: process.env.E2E_A_PASSWORD });
  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });

  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BASE}/connexion`);
  await page.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
  await page.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/app$/, { timeout: 15000 });

  await step("Format refusé (PDF) avec un message clair, avant tout envoi", async () => {
    const bad = path.join(os.tmpdir(), "notes.pdf");
    fs.writeFileSync(bad, "%PDF-1.4");
    await page.goto(`${BASE}/app/nouveau`);
    await page.getByTestId("file-input").setInputFiles(bad);
    await page.getByText("Format non pris en charge").waitFor({ timeout: 10000 });
  });

  await step("Bouton d'import bloqué tant que les droits ne sont pas confirmés", async () => {
    await page.getByTestId("file-input").setInputFiles(VIDEO);
    await page.getByText(path.basename(VIDEO)).waitFor();
    assert.equal(await page.getByRole("button", { name: "Importer la vidéo" }).isDisabled(), true);
    await page.getByLabel(/Je confirme détenir les droits/).check();
    assert.equal(await page.getByRole("button", { name: "Importer la vidéo" }).isDisabled(), false);
  });

  let projectId;
  await step("Envoi multipart : progression réelle, puis redirection vers le projet", async () => {
    const seen = new Set();
    await page.getByRole("button", { name: "Importer la vidéo" }).click();
    const bar = page.getByRole("progressbar");
    await bar.waitFor({ timeout: 10000 });
    const t0 = Date.now();
    while (!/\/app\/projets\/[0-9a-f-]{36}$/.test(page.url()) && Date.now() - t0 < 120000) {
      const v = await bar.getAttribute("aria-valuenow").catch(() => null);
      if (v) seen.add(Number(v));
      await page.waitForTimeout(100);
    }
    projectId = page.url().split("/").pop();
    assert.match(projectId, /^[0-9a-f-]{36}$/, "pas de redirection vers le projet");
    assert.ok(seen.size >= 2, `progression non observée (${[...seen]})`);
  });

  await step("Le fichier stocké est identique à l'original (taille + empreinte MD5)", async () => {
    const { data: v } = await db.from("source_videos").select("storage_key, declared_size_bytes").eq("project_id", projectId).single();
    const head = await s3.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: v.storage_key }));
    const original = fs.readFileSync(VIDEO);
    assert.equal(head.ContentLength, original.length);
    assert.equal(v.declared_size_bytes, original.length);
    const obj = await s3.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: v.storage_key }));
    const stored = Buffer.from(await obj.Body.transformToByteArray());
    assert.equal(md5(stored), md5(original));
  });

  await step("La base passe en « uploaded » et une vérification (probe) est mise en file, une seule fois", async () => {
    const { data: v } = await db.from("source_videos").select("id, status").eq("project_id", projectId).single();
    assert.equal(v.status, "uploaded");
    const { data: jobs } = await db.from("processing_jobs").select("kind, status").eq("source_video_id", v.id);
    assert.deepEqual(jobs, [{ kind: "probe", status: "queued" }]);
  });

  await step("La page projet affiche « Vérification… » et le nom du fichier", async () => {
    await page.getByText("Vérification…").first().waitFor({ timeout: 10000 });
    await page.getByText(path.basename(VIDEO)).first().waitFor();
  });

  await step("Le projet apparaît dans « Mes projets » avec son statut", async () => {
    await page.goto(`${BASE}/app/projets`);
    await page.getByRole("link", { name: /Vérification…/ }).waitFor({ timeout: 10000 });
  });

  for (const [label, waitForProgress] of [
    ["immédiatement après le clic", false],
    ["en plein transfert", true],
  ]) {
    await step(`Annulation ${label} : aucun projet orphelin, aucun traitement lancé`, async () => {
      const before = (await db.from("projects").select("id")).data.length;
      await page.goto(`${BASE}/app/nouveau`);
      await page.getByTestId("file-input").setInputFiles(VIDEO);
      await page.getByLabel(/Je confirme détenir les droits/).check();
      await page.getByRole("button", { name: "Importer la vidéo" }).click();
      if (waitForProgress) {
        await page.waitForFunction(
          () => Number(document.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")) > 0,
          null,
          { timeout: 30000 },
        );
      }
      await page.getByRole("button", { name: "Annuler" }).click({ timeout: 10000 });
      await page.getByRole("button", { name: "Importer la vidéo" }).waitFor({ timeout: 15000 });
      await page.waitForTimeout(2000);
      const after = (await db.from("projects").select("id")).data.length;
      assert.equal(after, before, "un projet est resté visible après annulation");
      const { data: pending } = await db.from("source_videos").select("id").eq("status", "pending_upload");
      assert.equal(pending.length, 0, "un envoi est resté en attente");
      const { data: jobs } = await db.from("processing_jobs").select("id");
      assert.equal(jobs.length, 1);
    });
  }

  await step("API : impossible de finaliser l'envoi d'un autre utilisateur", async () => {
    const r = await page.request.post(`${BASE}/api/uploads/00000000-0000-4000-8000-000000000000/complete`, {
      data: { uploadId: "x", parts: [{ partNumber: 1, etag: "x" }] },
    });
    assert.equal(r.status(), 404);
  });

  await step("API : refus sans session", async () => {
    const r = await (await browser.newContext()).request.post(`${BASE}/api/uploads`, {
      data: { filename: "a.mp4", size: 10, rightsConfirmed: true },
    });
    assert.equal(r.status(), 401);
  });

  await browser.close();
  for (const r of results) console.log(r.join("  "));
  const failed = results.filter((r) => r[0] === "✗").length;
  console.log(`\n${results.length - failed}/${results.length} réussis`);
  process.exit(failed ? 1 : 0);
})();
