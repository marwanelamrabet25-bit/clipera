/**
 * Génération multi-clips (navigateur réel → vraie base Supabase → faux S3) : choix du nombre de clips, suivi clip
 * par clip pendant le montage, clips prêts visibles sans attendre, échec expliqué, archive ZIP, confirmation de
 * suppression. Données préparées en SQL (projets d1/d2/d3 du compte E2E_EMAIL).
 */
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");
const B = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const P = (n) => `${B}/app/projets/e2e00000-0000-4000-8000-0000000000d${n}`;
const res = [];
async function step(n, f) { try { await f(); res.push("✓ " + n); } catch (e) { res.push("✗ " + n + " | " + e.message.split("\n")[0]); } }

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto(B + "/connexion");
  await p.getByLabel("Adresse e-mail").first().fill(process.env.E2E_EMAIL);
  await p.getByLabel("Mot de passe").fill(process.env.E2E_PASSWORD);
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForURL(/\/app$/, { timeout: 20000 });

  await step("Formulaire : Auto par défaut, 3/5 disponibles, 7/10 verrouillés sur l'offre Free (max 5)", async () => {
    await p.goto(P(3));
    const g = p.getByTestId("clip-count");
    await g.waitFor();
    assert.equal(await g.getByRole("button", { name: "Auto" }).getAttribute("aria-pressed"), "true");
    assert.ok(await g.getByRole("button", { name: "3", exact: true }).isEnabled());
    assert.ok(await g.getByRole("button", { name: "5", exact: true }).isEnabled());
    assert.ok(await g.getByRole("button", { name: /^7/ }).isDisabled());
    assert.ok(await g.getByRole("button", { name: /^10/ }).isDisabled());
    assert.equal(await p.locator('input[name="clip_mode"]').inputValue(), "auto");
    assert.equal(await p.locator('input[name="requested_clips"]').inputValue(), "5");
    await p.getByText(/environ 1 clip pour 6 min de parole/).waitFor();
    await g.getByRole("button", { name: "3", exact: true }).click();
    assert.equal(await p.locator('input[name="requested_clips"]').inputValue(), "3");
    assert.equal(await p.locator('input[name="clip_mode"]').inputValue(), "fixed");
    await p.getByRole("link", { name: /Jusqu'à 10 clips avec les offres payantes/ }).waitFor();
  });
  await step("Montage en cours : progression réelle par clip (1 prêt, 1 en montage, 1 en échec)", async () => {
    await p.goto(P(1));
    const prog = p.getByTestId("clip-progress");
    await prog.waitFor();
    await prog.getByText("Montage des clips · 1/3 prêt").waitFor();
    assert.deepEqual(await prog.locator("li").evaluateAll((l) => l.map((x) => x.dataset.status)), ["ready", "rendering", "failed"]);
    assert.equal(await prog.getByRole("progressbar").getAttribute("aria-valuenow"), "2");
  });
  await step("Montage en cours : le clip déjà prêt est visible et téléchargeable, sans bouton de suppression", async () => {
    const cards = p.getByTestId("clip-card");
    assert.equal(await cards.count(), 1);
    assert.match(await cards.first().locator("video").getAttribute("src"), /localhost:9010|X-Amz/);
    await cards.first().getByText("Sujet : client, boulangerie").waitFor();
    await cards.first().getByText("Histoire").waitFor();
    assert.equal(await cards.first().getByRole("button", { name: "Supprimer ce clip" }).count(), 0);
  });
  await step("Terminé : explication, échec isolé expliqué, archive ZIP téléchargeable", async () => {
    await p.goto(P(2));
    await p.getByText("2 passages de qualité sélectionnés, sur 2 sujets différents.").waitFor();
    await p.getByText("1 clip n'a pas pu être monté").waitFor();
    const zip = p.getByTestId("zip-download");
    assert.match(await zip.textContent(), /Tout télécharger \(2 clips, ZIP\)/);
    const href = await zip.getAttribute("href");
    assert.match(href, /clips\.zip.*response-content-disposition=attachment/);
    const r = await p.request.get(href);
    assert.equal(r.status(), 200);
    assert.equal(await p.getByTestId("clip-card").count(), 2);
  });
  await step("Suppression d'un clip : confirmation puis annulation (rien n'est supprimé)", async () => {
    const card = p.getByTestId("clip-card").first();
    await card.getByRole("button", { name: "Supprimer ce clip" }).click();
    await card.getByRole("button", { name: "Annuler" }).click();
    await card.getByRole("button", { name: "Supprimer ce clip" }).waitFor();
    assert.equal(await p.getByTestId("clip-card").count(), 2);
  });
  await step("Mobile : sélecteur de clips et suivi lisibles, sans défilement horizontal", async () => {
    const m = await b.newContext({ ...devices["iPhone 13"] });
    await m.addCookies(await ctx.cookies());
    const mp = await m.newPage();
    for (const n of [1, 3]) {
      await mp.goto(P(n));
      await mp.waitForLoadState("networkidle");
      // Sur iPhone, un contenu trop large élargit la zone d'affichage (page dézoomée) : on vérifie les deux.
      const [vw, sw] = await mp.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]);
      assert.ok(vw === 390 && sw <= 390, `projet ${n} : largeur ${vw}/${sw}px au lieu de 390`);
      await mp.screenshot({ path: `${process.env.SHOTS}/multi-mobile-${n}.png`, fullPage: true });
    }
    await m.close();
  });
  await p.goto(P(1));
  await p.screenshot({ path: `${process.env.SHOTS}/multi-desktop-1.png`, fullPage: true });
  console.log(res.join("\n"));
  console.log(`\n${res.filter((r) => r.startsWith("✓")).length}/${res.length} réussis`);
  await b.close();
  process.exit(res.some((r) => r.startsWith("✗")) ? 1 : 0);
})();
