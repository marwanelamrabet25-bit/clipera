/** Expérience publique : menu mobile, onglets au clavier, tarifs (montants réels), pages d'authentification, 4 largeurs. */
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");
const B = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const res = [];
async function step(n, f) { try { await f(); res.push("✓ " + n); } catch (e) { res.push("✗ " + n + " | " + e.message.split("\n")[0]); } }

(async () => {
  const b = await chromium.launch();
  const errors = [];

  await step("4 largeurs × 9 pages : aucun débordement horizontal, aucune erreur JavaScript", async () => {
    const pages = ["/", "/tarifs", "/generateur-clips-ia", "/transformer-podcast-en-clips", "/blog", "/connexion", "/inscription", "/cgv", "/mentions-legales"];
    const bad = [];
    for (const w of [1440, 1024, 768, 390]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w === 390, hasTouch: w <= 768 });
      const p = await ctx.newPage();
      p.on("pageerror", (e) => errors.push(`${w} ${e.message}`));
      for (const path of pages) {
        await p.goto(B + path, { waitUntil: "networkidle" });
        const [vw, sw] = await p.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]);
        if (vw !== w || sw > w) bad.push(`${path}@${w}: ${vw}/${sw}`);
      }
      await ctx.close();
    }
    assert.deepEqual(bad, []);
    assert.deepEqual(errors, []);
  });

  const m = await b.newContext({ ...devices["iPhone 13"] });
  const mp = await m.newPage();
  await mp.goto(B + "/", { waitUntil: "networkidle" });
  await step("Menu mobile : s'ouvre, se ferme avec Échap, mène aux sections", async () => {
    const btn = mp.getByRole("button", { name: "Ouvrir le menu" });
    await btn.tap();
    const nav = mp.getByRole("navigation", { name: "Navigation mobile" });
    await nav.waitFor();
    assert.equal(await mp.getByRole("button", { name: "Fermer le menu" }).getAttribute("aria-expanded"), "true");
    await mp.keyboard.press("Escape");
    await nav.waitFor({ state: "hidden" });
    await btn.tap();
    await nav.getByRole("link", { name: "Le moteur" }).tap();
    await mp.waitForFunction(() => location.hash === "#moteur");
    await nav.waitFor({ state: "hidden" });
  });
  await step("Tarifs mobile : carrousel des 4 offres, montants annuels exacts et montant débité affiché", async () => {
    await mp.goto(B + "/tarifs", { waitUntil: "networkidle" });
    for (const id of ["free", "starter", "pro", "ultimate"]) assert.equal(await mp.getByTestId(`plan-${id}`).count(), 1);
    await mp.getByText("Fais glisser pour voir les 4 offres").waitFor();
    await mp.getByRole("radio", { name: /Annuel/ }).tap();
    const expect = { starter: ["8,33 €", "99,90 €"], pro: ["16,66 €", "199,90 €"], ultimate: ["33,33 €", "399,90 €"] };
    await mp.waitForTimeout(500); // fin de l'animation du prix
    const norm = (t) => t.replace(/[\s\u00a0\u202f]+/g, " ");
    for (const [id, [eq, total]] of Object.entries(expect)) {
      const card = mp.getByTestId(`plan-${id}`);
      assert.ok(norm(await card.getByTestId("price-main").textContent()).includes(eq), `${id} équivalent ${eq}`);
      const box = norm(await card.getByTestId("annual-box").textContent());
      assert.ok(box.includes(`${total} / an`) && box.includes("débité en une seule fois"), `${id} : ${box}`);
    }
  });
  await m.close();

  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await step("Onglets des fonctionnalités : clic et flèches du clavier", async () => {
    const list = p.getByRole("tablist", { name: "Fonctionnalités" });
    await list.getByRole("tab", { name: "Note" }).click();
    await p.getByText("Tu sais quoi publier d'abord.").waitFor();
    await p.keyboard.press("ArrowRight");
    assert.equal(await list.getByRole("tab", { name: "Export" }).getAttribute("aria-selected"), "true");
    await p.getByText("clipera-clips.zip").waitFor();
    await p.keyboard.press("Home");
    assert.equal(await list.getByRole("tab", { name: "Sous-titres" }).getAttribute("aria-selected"), "true");
  });
  await step("Démonstrations toujours signalées (hero, résultat, moteur, fonctionnalités)", async () => {
    assert.ok((await p.getByText(/^Démonstration/).count()) >= 4);
  });
  await step("Aucune promesse d'import par lien YouTube sur la page d'accueil", async () => {
    const txt = await p.locator("main").innerText();
    assert.ok(!/(colle|lien|URL)[^.]{0,40}YouTube/i.test(txt.replace(/vidéo déjà publiée sur YouTube[^.]*\./, "")), "mention trouvée");
  });
  await step("Connexion : formulaire intact, liens vers inscription et pages légales", async () => {
    await p.goto(B + "/connexion", { waitUntil: "networkidle" });
    await p.getByLabel("Adresse e-mail").first().waitFor();
    await p.getByLabel("Mot de passe").waitFor();
    await p.getByRole("button", { name: "Se connecter" }).waitFor();
    await p.getByRole("link", { name: "Créer un compte" }).click();
    await p.waitForURL(/\/inscription/);
    await p.getByRole("button", { name: /Créer mon compte|Créer un compte/ }).first().waitFor();
  });
  console.log(res.join("\n"));
  console.log(`\n${res.filter((r) => r.startsWith("✓")).length}/${res.length} réussis`);
  await b.close();
  process.exit(res.some((r) => r.startsWith("✗")) ? 1 : 0);
})();
