/**
 * Page tarifs : sélecteur Mensuel/Annuel, montants exacts (lus en base), badges, boutons, récapitulatif avant
 * paiement, URL falsifiée, mobile. Prérequis : application lancée, compte E2E_A_EMAIL / E2E_A_PASSWORD.
 */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const results = [];
async function step(name, fn) {
  try { await fn(); results.push(["✓", name]); } catch (e) { results.push(["✗", name, e.message.split("\n").slice(0, 6).join(" | ")]); }
}
const norm = (s) => s.replace(/[\u202f\u00a0]/g, " ");
const flat = (s) => norm(s).replace(/\s+/g, ""); // montants comparés indépendamment des espaces
const EXPECTED = {
  starter: { m: "9,99 €", eq: "8,33 €", y: "99,90 €", save: "19,98 €" },
  pro: { m: "19,99 €", eq: "16,66 €", y: "199,90 €", save: "39,98 €" },
  ultimate: { m: "39,99 €", eq: "33,33 €", y: "399,90 €", save: "79,98 €" },
};

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
  await page.goto(`${BASE}/#tarifs`);
  const card = (id) => page.getByTestId(`plan-${id}`);

  await step("Mensuel par défaut : prix habituels « / mois », pas d'économie affichée", async () => {
    for (const [id, e] of Object.entries(EXPECTED)) {
      assert.equal(flat(await card(id).getByTestId("price-main").innerText()), flat(`${e.m} / mois`));
      assert.equal(await card(id).getByTestId("annual-box").isVisible(), false);
      assert.equal(await card(id).getByText("2 MOIS OFFERTS").count(), 0);
    }
    assert.ok(flat(await card("free").innerText()).includes("0€/mois"));
  });

  await step("Annuel : équivalent mensuel en grand, ancien prix barré, total annuel, économie, badge", async () => {
    await page.getByRole("radio", { name: /Annuel/ }).click();
    for (const [id, e] of Object.entries(EXPECTED)) {
      const c = card(id);
      await c.getByTestId("annual-box").waitFor({ state: "visible" });
      assert.equal(flat(await c.getByTestId("price-main").innerText()), flat(`${e.eq} / mois`));
      assert.equal(norm(await c.locator("s").innerText()), `${e.m}/mois`);
      const box = norm(await c.getByTestId("annual-box").innerText());
      assert.match(box, new RegExp(`${e.y.replace(",", ",")} / an`));
      assert.match(box, /Montant total débité en une seule fois aujourd'hui/);
      assert.match(box, new RegExp(`Économisez ${e.save} par an`));
      await c.getByText("2 MOIS OFFERTS").waitFor();
    }
    assert.equal(await card("free").getByTestId("annual-box").isVisible(), false); // Free : aucun montant annuel
  });

  await step("Retour en Mensuel : instantané, sans rechargement", async () => {
    await page.evaluate(() => (window.__noReload = true));
    await page.getByRole("radio", { name: "Mensuel" }).click();
    assert.equal(flat(await card("pro").getByTestId("price-main").innerText()), flat("19,99 € / mois"));
    assert.equal(await page.evaluate(() => window.__noReload), true);
  });

  await step("PRO mis en avant « Le plus populaire »", async () => {
    await card("pro").getByText("Le plus populaire").waitFor();
    assert.equal(await page.getByText("Le plus populaire").count(), 1);
  });

  await step("Boutons : Free → inscription ; Pro annuel → récapitulatif (connexion demandée si besoin)", async () => {
    assert.equal(await card("free").getByRole("link").getAttribute("href"), "/inscription");
    await page.getByRole("radio", { name: /Annuel/ }).click();
    assert.equal(await card("pro").getByRole("link").getAttribute("href"), "/app/abonnement/recapitulatif?offre=pro&periode=annuel");
    await card("pro").getByRole("link").click();
    await page.waitForURL(/\/connexion\?suite=/);
  });

  await step("Connexion depuis le parcours d'abonnement", async () => {
    if (!page.url().includes("/connexion")) await page.goto(`${BASE}/connexion?suite=${encodeURIComponent("/app/abonnement/recapitulatif?offre=pro&periode=annuel")}`);
    await page.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();
  });

  await step("Récapitulatif annuel PRO : montant débité aujourd'hui, période, renouvellement, prix de renouvellement", async () => {
    await page.waitForURL(/recapitulatif\?offre=pro&periode=annuel/, { timeout: 15000 });
    assert.equal(norm(await page.getByTestId("charged-today").locator("p").nth(1).innerText()), "199,90 €");
    const rows = norm(await page.getByTestId("summary-rows").innerText());
    for (const t of ["Pro — annuelle", "16,66 € / mois", "12 mois", "199,90 € / an"]) assert.ok(rows.includes(t), t);
    const next = new Date(); next.setFullYear(next.getFullYear() + 1);
    assert.ok(rows.includes(String(next.getFullYear())), "année de renouvellement");
    assert.equal(await page.getByRole("button", { name: /Payer 199,90/ }).isDisabled(), true); // pas de paiement simulé
  });

  await step("Récapitulatif mensuel STARTER : 9,99 € aujourd'hui puis chaque mois", async () => {
    await page.goto(`${BASE}/app/abonnement/recapitulatif?offre=starter&periode=mensuel`);
    assert.equal(norm(await page.getByTestId("charged-today").locator("p").nth(1).innerText()), "9,99 €");
    assert.ok(norm(await page.getByTestId("summary-rows").innerText()).includes("9,99 € / mois"));
  });

  await step("Adresse falsifiée : offre inconnue ou gratuite → page introuvable (aucun montant pris dans l'URL)", async () => {
    for (const q of ["offre=hack&periode=annuel", "offre=free&periode=annuel", "offre=pro%27--&periode=annuel"]) {
      await page.goto(`${BASE}/app/abonnement/recapitulatif?${q}`);
      await page.getByText(/could not be found|introuvable/i).first().waitFor({ timeout: 10000 });
    }
  });

  await step("Page Abonnement : même tableau, offre actuelle (Free) indiquée", async () => {
    await page.goto(`${BASE}/app/abonnement`);
    await card("free").getByText("Offre actuelle").first().waitFor();
    await page.getByRole("radio", { name: /Annuel/ }).click();
    await card("ultimate").getByText("399,90 €").waitFor();
  });

  await step("Mobile : sélecteur utilisable, prix et total annuel visibles, pas de débordement", async () => {
    const m = await (await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })).newPage();
    await m.goto(`${BASE}/#tarifs`);
    await m.getByRole("radio", { name: /Annuel/ }).tap();
    const c = m.getByTestId("plan-pro");
    await c.scrollIntoViewIfNeeded();
    await c.getByTestId("annual-box").waitFor({ state: "visible" });
    assert.ok(await c.getByText("199,90 €").isVisible());
    const box = await m.getByRole("radiogroup").boundingBox();
    assert.ok(box.height >= 40, "sélecteur assez haut pour le doigt");
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `débordement ${overflow}px`);
    await m.screenshot({ path: "/tmp/claude-0/pricing-mobile.png", fullPage: false });
  });

  try {
    const d = await (await browser.newContext({ viewport: { width: 1360, height: 1000 }, deviceScaleFactor: 2 })).newPage();
    await d.goto(`${BASE}/`);
    await d.getByRole("radio", { name: /Annuel/ }).click();
    await d.waitForTimeout(500);
    await d.getByRole("radiogroup").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await d.evaluate(() => window.scrollBy(0, -140));
    await d.screenshot({ path: "/tmp/claude-0/pricing-desktop.png" });
  } catch (e) {
    console.log("capture impossible :", e.message.split("\n")[0]);
  }

  await browser.close();
  for (const r of results) console.log(r.join(" "));
  process.exit(results.some((r) => r[0] === "✗") ? 1 : 0);
})();
