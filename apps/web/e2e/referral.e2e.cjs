/** Parrainage : lien, auto-parrainage bloqué, -50 % 1er mois mensuel, pas en annuel, cases obligatoires, compteurs. Comptes e2e-parrain / e2e-filleul requis (E2E_PASSWORD). */
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");
const B = "http://localhost:3100", PW = process.env.E2E_PASSWORD;
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
  const cP = await b.newContext(), cF = await b.newContext();
  const p = await login(cP, "e2e-parrain@clipera.test");
  let code;
  await step("Parrain : lien personnel affiché, compteurs à 0", async () => {
    await p.goto(B + "/app/parrainage");
    const url = await p.locator("#referral-link").inputValue();
    code = url.split("parrain=")[1];
    assert.match(url, /^http.*\/\?parrain=[A-Z2-9]{8}$/);
    assert.equal(await p.getByText("Amis inscrits avec ton lien").locator("..").locator("dd").innerText(), "0");
  });
  await step("Auto-parrainage sans effet", async () => {
    await p.goto(B + "/?parrain=" + code); await p.goto(B + "/app/parrainage");
    assert.equal(await p.getByText("Amis inscrits avec ton lien").locator("..").locator("dd").innerText(), "0");
  });
  const f0 = await cF.newPage();
  await f0.goto(B + "/?parrain=" + code.toLowerCase());
  const f = await login(cF, "e2e-filleul@clipera.test");
  await step("Filleul rattaché : -50 % sur le 1er mois mensuel (9,99 € pour Pro)", async () => {
    await f.goto(B + "/app/abonnement/recapitulatif?offre=pro&periode=mensuel");
    const t = await f.getByTestId("charged-today").innerText();
    assert.ok(t.includes("9,99"), t); assert.ok(t.includes("Parrainage"), t); assert.ok(t.includes("19,99"), t);
  });
  await step("Annuel : pas de réduction (199,90 €)", async () => {
    await f.goto(B + "/app/abonnement/recapitulatif?offre=pro&periode=annuel");
    assert.ok((await f.getByTestId("charged-today").innerText()).includes("199,90"));
  });
  await step("Bouton Payer bloqué tant que les 2 cases ne sont pas cochées", async () => {
    await f.goto(B + "/app/abonnement/recapitulatif?offre=starter&periode=mensuel");
    const btn = f.getByRole("button", { name: /Payer 4,99/ });
    assert.equal(await btn.isDisabled(), true);
    await f.locator("#accept-cgv").check(); assert.equal(await btn.isDisabled(), true);
    await f.locator("#start-now").check(); assert.equal(await btn.isDisabled(), false);
  });
  await step("Serveur : paiement refusé sans les accords", async () => {
    const r = await f.request.post(B + "/api/billing/checkout", { data: { plan: "starter", billing: "monthly" } });
    const j = await r.json(); assert.ok(r.status() === 400 || r.status() === 503, String(r.status()));
    if (r.status() === 400) assert.equal(j.error.code, "consent_required");
  });
  await step("Parrain : 1 ami inscrit, 0 client", async () => {
    await p.goto(B + "/app/parrainage");
    assert.equal(await p.getByText("Amis inscrits avec ton lien").locator("..").locator("dd").innerText(), "1");
    assert.equal(await p.getByText("Devenus clients").locator("..").locator("dd").innerText(), "0");
  });
  await step("Mobile : page Parrainage sans débordement", async () => {
    const m = await b.newContext({ ...devices["Pixel 7"], storageState: await cP.storageState() });
    const mp = await m.newPage(); await mp.goto(B + "/app/parrainage");
    const [sw, vw] = await mp.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    assert.ok(sw <= vw, `${sw} > ${vw}`);
    await mp.screenshot({ path: "/tmp/parrainage_mobile.png" });
  });
  await b.close();
  console.log(res.join("\n"));
})();
