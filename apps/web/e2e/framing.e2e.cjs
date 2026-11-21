/** Choix du cadrage : 3 modes, Stable par défaut, transmis au traitement, mémorisé comme préférence. */
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");
const assert = require("node:assert/strict");
const fs = require("node:fs");
fs.readFileSync(`${__dirname}/../.env.local`, "utf8")
  .split("\n")
  .forEach((l) => {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const URL_P = `${BASE}/app/projets/${process.env.E2E_PROJECT_ID}`;
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["✓", name]);
  } catch (e) {
    results.push(["✗", name, e.message.split("\n").slice(0, 3).join(" | ")]);
  }
}
(async () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  await db.auth.signInWithPassword({ email: process.env.E2E_A_EMAIL, password: process.env.E2E_A_PASSWORD });
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BASE}/connexion`);
  await page.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
  await page.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/app$/, { timeout: 15000 });

  await step("3 modes proposés, Stable sélectionné par défaut", async () => {
    await page.goto(URL_P);
    for (const l of ["Stable", "Suivi de l'intervenant", "Large"]) await page.getByText(l, { exact: true }).waitFor();
    assert.equal(await page.getByRole("radio", { name: /^Stable/ }).isChecked(), true);
  });
  await step("Format horizontal : choix du cadrage masqué (rien à recadrer)", async () => {
    await page.getByText("Horizontal 16:9").click();
    assert.equal(await page.getByText("Suivi de l'intervenant", { exact: true }).count(), 0);
    await page.getByText("Vertical 9:16").click();
  });
  await step("Choix « Large » transmis au traitement et mémorisé comme préférence", async () => {
    await page.getByText("Large", { exact: true }).click();
    await page.getByRole("button", { name: "Générer les clips" }).click();
    await page.getByTestId("job-progress").waitFor({ timeout: 15000 });
    const { data: jobs } = await db.from("processing_jobs").select("id, options").eq("kind", "clip_generation");
    assert.equal(jobs[0].options.framing, "wide");
    const { data: s } = await db.from("user_settings").select("default_framing").single();
    assert.equal(s.default_framing, "wide");
    // Le worker en ligne peut prendre le job immédiatement : on annule seulement s'il attend encore.
    const cancel = page.getByRole("button", { name: "Annuler la génération" });
    if (await cancel.isVisible()) await cancel.click();
  });
  await step("La préférence est reprise à la génération suivante", async () => {
    await page.goto(URL_P);
    assert.equal(await page.getByRole("radio", { name: /^Large/ }).isChecked(), true);
  });
  await browser.close();
  for (const r of results) console.log(r.join(" "));
  process.exit(results.some((r) => r[0] === "✗") ? 1 : 0);
})();
