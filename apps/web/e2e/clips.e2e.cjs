/**
 * Test de bout en bout des écrans de génération : navigateur réel → actions serveur → vraie base Supabase.
 *
 * Le worker n'étant pas hébergé, son rôle est joué entre les phases (mises à jour SQL avec le rôle service +
 * dépôt d'un vrai clip MP4 rendu par le worker dans le stockage de test). Phases (E2E_PHASE) :
 *   form      formulaire, lancement, double clic sans double job, suivi « en attente »
 *   progress  étape en cours affichée d'après le vrai statut (rendering)
 *   results   clips : aperçu lisible, note expliquée, téléchargement, bibliothèque, isolation, relance + annulation
 *   failed    échec expliqué avec quota recrédité
 */
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
const PROJECT = process.env.E2E_PROJECT_ID;
const PHASE = process.env.E2E_PHASE;
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["✓", name]);
  } catch (e) {
    results.push(["✗", name, e.message.split("\n")[0]]);
  }
}

async function login(browser, email, password) {
  const page = await (await browser.newContext({ acceptDownloads: true })).newPage();
  await page.goto(`${BASE}/connexion`);
  await page.getByLabel("Adresse e-mail").first().fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/app$/, { timeout: 15000 });
  return page;
}

(async () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  await db.auth.signInWithPassword({ email: process.env.E2E_A_EMAIL, password: process.env.E2E_A_PASSWORD });
  const jobs = async () =>
    (await db.from("processing_jobs").select("*").eq("project_id", PROJECT).eq("kind", "clip_generation").order("created_at"))
      .data;

  const browser = await chromium.launch();
  const page = await login(browser, process.env.E2E_A_EMAIL, process.env.E2E_A_PASSWORD);
  const url = `${BASE}/app/projets/${PROJECT}`;

  if (PHASE === "form") {
    await step("Formulaire : 5 clips max (offre Free), 3 formats, sous-titres, quota affiché", async () => {
      await page.goto(url);
      const slider = page.getByLabel("Nombre de clips souhaité");
      assert.equal(await slider.getAttribute("max"), "5");
      for (const f of ["Vertical 9:16", "Carré 1:1", "Horizontal 16:9"]) await page.getByText(f).waitFor();
      await page.getByText("filigrane Clipera inclus avec l'offre Free").waitFor();
      await page.getByText(/3 restante\(s\)/).waitFor();
      await page.getByLabel("Style des sous-titres").selectOption("modern");
    });

    await step("Lancement (double clic) → un seul job, options transmises, quota réservé une fois", async () => {
      const btn = page.getByRole("button", { name: "Générer les clips" });
      await btn.dblclick();
      await page.getByTestId("job-progress").waitFor({ timeout: 15000 });
      const list = await jobs();
      assert.equal(list.length, 1);
      assert.equal(list[0].status, "queued");
      assert.equal(list[0].requested_clips, 3);
      assert.deepEqual(list[0].options.captions, { enabled: true, style: "modern" });
      assert.equal(list[0].options.format, "9:16");
      assert.equal(list[0].options.watermark, true);
      const { data: q } = await db.rpc("my_quota");
      assert.equal(q[0].videos_used, 1);
    });

    await step("Suivi : étapes réelles + message honnête d'attente + bouton d'annulation", async () => {
      await page.getByText("En attente d'un serveur de traitement").waitFor();
      await page.getByRole("button", { name: "Annuler la génération" }).waitFor();
      assert.equal(await page.getByRole("button", { name: "Générer les clips" }).count(), 0); // pas de 2e lancement
    });
  }

  if (PHASE === "progress") {
    await step("Étape en cours = Montage (statut rendering), étapes précédentes cochées", async () => {
      await page.goto(url);
      const current = page.locator('[aria-current="step"]');
      await current.waitFor();
      assert.match(await current.innerText(), /Montage/);
      assert.equal(await page.getByText("— terminé").count(), 3);
    });
  }

  if (PHASE === "results") {
    await step("Clips affichés : titre, note, durée, extrait, explication de la sélection de base", async () => {
      await page.goto(url);
      await page.getByText("1 clip prêt").waitFor();
      await page.getByText("Sélection automatique de base").waitFor();
      const card = page.getByTestId("clip-card");
      assert.equal(await card.count(), 1);
      const text = await card.innerText();
      assert.match(text, /82\/100/);
      assert.match(text, /Alors dis-moi/);
      assert.match(text, /720×1280/);
      await card.getByText("Pourquoi ce passage ?").click();
      await card.getByText("Accroche", { exact: true }).waitFor();
    });

    await step("Aperçu : la vidéo se charge et se lit réellement dans le navigateur", async () => {
      const video = page.locator("video");
      await video.evaluate((v) => v.play().catch(() => {}));
      await page.waitForFunction(() => document.querySelector("video").currentTime > 0.5, null, { timeout: 15000 });
      const dims = await video.evaluate((v) => [v.videoWidth, v.videoHeight]);
      assert.deepEqual(dims, [720, 1280]);
    });

    await step("Téléchargement : fichier MP4 nommé proprement, identique au clip stocké", async () => {
      const [dl] = await Promise.all([page.waitForEvent("download"), page.getByText("Télécharger le MP4").click()]);
      assert.match(dl.suggestedFilename(), /^clipera-alors-dis-moi-.*-1\.mp4$/);
      const size = fs.statSync(await dl.path()).size;
      assert.equal(size, Number(process.env.E2E_CLIP_SIZE));
    });

    await step("Bibliothèque : miniature du clip, lien vers le projet", async () => {
      await page.goto(`${BASE}/app/bibliotheque`);
      const item = page.getByTestId("library-clip");
      assert.equal(await item.count(), 1);
      await page.waitForFunction(() => {
        const img = document.querySelector('[data-testid="library-clip"] img');
        return img && img.complete && img.naturalWidth > 0;
      });
      await item.click();
      await page.waitForURL(url);
    });

    await step("Isolation : B ne voit ni le projet ni le clip de A", async () => {
      const b = await login(browser, process.env.E2E_B_EMAIL, process.env.E2E_A_PASSWORD);
      await b.goto(url);
      await b.getByText(/could not be found|introuvable/i).first().waitFor({ timeout: 15000 }); // page 404
      assert.equal(await b.getByText("Podcast test").count(), 0);
      assert.equal(await b.locator("video").count(), 0);
      await b.goto(`${BASE}/app/bibliotheque`);
      await b.getByText("Ta bibliothèque est vide").waitFor();
    });

    await step("Relance puis annulation : statut annulé et quota recrédité", async () => {
      await page.goto(url);
      await page.getByText("Générer à nouveau avec d'autres options").click();
      await page.getByText("Carré 1:1").click();
      await page.getByRole("button", { name: "Générer les clips" }).click();
      await page.getByRole("button", { name: "Annuler la génération" }).click();
      await page.getByText("Génération annulée").waitFor({ timeout: 15000 });
      const list = await jobs();
      assert.equal(list.length, 2);
      assert.equal(list[1].status, "cancelled");
      assert.equal(list[1].options.format, "1:1");
      const { data: q } = await db.rpc("my_quota");
      assert.equal(q[0].videos_used, 1); // la relance annulée ne compte pas
      assert.equal(await page.getByTestId("clip-card").count(), 1); // les clips précédents restent visibles
    });

    await step("Nouvelle relance mise en file (pour la phase « échec »)", async () => {
      await page.getByRole("button", { name: "Générer les clips" }).click();
      await page.getByTestId("job-progress").waitFor({ timeout: 15000 });
    });
  }

  if (PHASE === "failed") {
    await step("Échec : message du worker affiché, étape en échec marquée, quota recrédité, relance possible", async () => {
      await page.goto(url);
      await page.getByText("La génération n'a pas abouti").waitFor();
      await page.getByText(/Aucun passage de cette vidéo n'atteint notre niveau de qualité/).waitFor();
      await page.getByText("— échec").waitFor();
      await page.getByRole("button", { name: "Générer les clips" }).waitFor();
      const { data: q } = await db.rpc("my_quota");
      assert.equal(q[0].videos_used, 1);
    });

    await step("Mobile : pas de défilement horizontal sur la page projet", async () => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(url);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 0, `débordement de ${overflow}px`);
    });
  }

  await browser.close();
  for (const r of results) console.log(r.join(" "));
  process.exit(results.some((r) => r[0] === "✗") ? 1 : 0);
})();
