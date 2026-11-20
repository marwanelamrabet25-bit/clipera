/**
 * Test de bout en bout de la connexion et de l'espace /app, contre la VRAIE base Supabase.
 *
 * Prérequis : application lancée (E2E_BASE_URL, défaut http://localhost:3100) et deux comptes de test
 * temporaires (E2E_A_EMAIL/E2E_A_PASSWORD, E2E_B_EMAIL/E2E_B_PASSWORD). Le compte A possède un projet
 * « Projet secret de A ». Les comptes sont créés puis supprimés autour du test (voir docs/TESTING.md).
 *
 * Le lien magique ne peut pas être reçu ici : la session est ouverte par mot de passe via la même
 * bibliothèque (@supabase/ssr) et les mêmes cookies que l'application.
 */
const { chromium } = require("playwright");
const { createServerClient } = require("@supabase/ssr");
const assert = require("node:assert/strict");
require("node:fs")
  .readFileSync(`${__dirname}/../.env.local`, "utf8")
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

async function sessionCookies(email, password) {
  const jar = new Map();
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cs) => cs.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  const host = new URL(BASE).hostname;
  return [...jar].map(([name, value]) => ({ name, value, domain: host, path: "/", httpOnly: false, sameSite: "Lax" }));
}

(async () => {
  const browser = await chromium.launch();

  // ── Visiteur non connecté ──
  const anon = await browser.newPage();
  await step("Visiteur : /app redirige vers /connexion en gardant la destination", async () => {
    await anon.goto(`${BASE}/app/projets`);
    const u = new URL(anon.url());
    assert.equal(u.pathname, "/connexion");
    assert.equal(u.searchParams.get("suite"), "/app/projets");
  });
  await step("Visiteur : e-mail invalide → message d'erreur clair, rien n'est envoyé", async () => {
    await anon.goto(`${BASE}/connexion`);
    await anon.getByText("Pas de mot de passe ? Recevoir un lien").click();
    const linkForm = anon.locator("details form");
    await linkForm.getByLabel("Adresse e-mail").fill("pas-un-email");
    await linkForm.getByRole("button", { name: /Recevoir un lien/ }).click();
    await linkForm.getByText("Adresse e-mail invalide.").waitFor({ timeout: 10000 });
  });
  await step("Visiteur : mauvais mot de passe → message clair", async () => {
    await anon.goto(`${BASE}/connexion`);
    await anon.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
    await anon.getByLabel("Mot de passe").fill("mauvais-mot-de-passe");
    await anon.getByRole("button", { name: "Se connecter" }).click();
    await anon.getByText("E-mail ou mot de passe incorrect.").waitFor({ timeout: 15000 });
  });
  await step("Visiteur : inscription refusée si mot de passe < 8 caractères (aucun e-mail envoyé)", async () => {
    await anon.goto(`${BASE}/inscription`);
    await anon.getByLabel("Adresse e-mail").fill("nouveau@clipera.test");
    await anon.getByLabel("Mot de passe").fill("court");
    await anon.getByRole("button", { name: "Créer mon compte" }).click();
    await anon.getByText("Le mot de passe doit contenir au moins 8 caractères.").waitFor({ timeout: 10000 });
  });
  await step("Lien expiré ou falsifié → retour à la connexion avec un avertissement", async () => {
    await anon.goto(`${BASE}/auth/confirm?token_hash=faux&type=email`);
    assert.equal(new URL(anon.url()).pathname, "/connexion");
    await anon.getByText("Ce lien n'est plus valide").waitFor({ timeout: 10000 });
  });
  await step("Redirection externe impossible (?suite=https://site-pirate.com)", async () => {
    await anon.goto(`${BASE}/connexion?suite=${encodeURIComponent("https://site-pirate.com")}`);
    const hidden = await anon.locator('input[name="suite"]').first().inputValue();
    assert.equal(hidden, "https://site-pirate.com"); // reçu tel quel…
    // …mais filtré côté serveur : la route de confirmation ne redirige que vers /app.
    const r = await anon.request.get(`${BASE}/auth/confirm?code=x&suite=${encodeURIComponent("//site-pirate.com")}`, {
      maxRedirects: 0,
    });
    assert.ok(!r.headers().location.includes("site-pirate"), r.headers().location);
  });

  // ── Utilisateur A connecté ──
  const ctxA = await browser.newContext();
  const a = await ctxA.newPage();
  await step("A : connexion par le formulaire (e-mail + mot de passe) → retour à la page demandée", async () => {
    await a.goto(`${BASE}/app/projets`);
    await a.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
    await a.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
    await a.getByRole("button", { name: "Se connecter" }).click();
    await a.waitForURL(/\/app\/projets$/, { timeout: 15000 });
  });
  await step("A : le dashboard affiche ses vraies données (quota Free : 3 vidéos, 30 min)", async () => {
    await a.goto(`${BASE}/app`);
    await a.getByRole("heading", { name: /^Bonjour / }).waitFor({ timeout: 15000 });
    await a.getByText("0 / 3").first().waitFor();
    await a.getByText("30 min", { exact: true }).first().waitFor();
    await a.getByText("Projet secret de A").waitFor();
  });
  await step("A : /connexion renvoie vers /app quand on est déjà connecté", async () => {
    await a.goto(`${BASE}/connexion`);
    assert.equal(new URL(a.url()).pathname, "/app");
  });
  await step("A : changer son nom affiché met à jour le message de bienvenue", async () => {
    await a.goto(`${BASE}/app/parametres`);
    await a.getByLabel("Nom affiché").fill("Testeur A");
    await a.getByRole("button", { name: "Enregistrer" }).click();
    await a.getByText("Enregistré.").waitFor({ timeout: 10000 });
    await a.goto(`${BASE}/app`);
    await a.getByRole("heading", { name: "Bonjour Testeur A" }).waitFor({ timeout: 15000 });
  });
  await step("A : la page Abonnement montre l'offre Free comme actuelle et 4 offres", async () => {
    await a.goto(`${BASE}/app/abonnement`);
    await a.getByText("Actuelle", { exact: true }).waitFor({ timeout: 15000 });
    assert.equal(await a.getByRole("button", { name: "Bientôt disponible" }).count(), 3);
  });
  for (const path of ["/app/nouveau", "/app/projets", "/app/bibliotheque"]) {
    await step(`A : ${path} s'affiche sans erreur`, async () => {
      const r = await a.goto(`${BASE}${path}`);
      assert.equal(r.status(), 200);
      await a.locator("h1").first().waitFor();
    });
  }

  // ── Utilisateur B : isolation ──
  const ctxB = await browser.newContext();
  await ctxB.addCookies(await sessionCookies(process.env.E2E_B_EMAIL, process.env.E2E_B_PASSWORD));
  const b = await ctxB.newPage();
  await step("B : ne voit pas le projet de A", async () => {
    await b.goto(`${BASE}/app/projets`);
    await b.getByText("Aucun projet pour l'instant").waitFor({ timeout: 15000 });
    assert.equal(await b.getByText("Projet secret de A").count(), 0);
  });
  await step("B : n'a pas hérité du nom de A", async () => {
    await b.goto(`${BASE}/app`);
    await b.getByRole("heading", { name: "Bonjour e2e-b" }).waitFor({ timeout: 15000 });
  });

  // ── Changement de mot de passe, déconnexion, reconnexion ──
  const newPassword = `${process.env.E2E_A_PASSWORD}-nouveau`;
  await step("A : changer son mot de passe (confirmation différente refusée, puis succès)", async () => {
    await a.goto(`${BASE}/app/parametres`);
    await a.getByLabel("Nouveau mot de passe").fill(newPassword);
    await a.getByLabel("Confirmation").fill("autre-chose-123");
    await a.getByRole("button", { name: "Mettre à jour le mot de passe" }).click();
    await a.getByText("Les deux mots de passe ne correspondent pas.").waitFor({ timeout: 10000 });
    await a.getByLabel("Nouveau mot de passe").fill(newPassword);
    await a.getByLabel("Confirmation").fill(newPassword);
    await a.getByRole("button", { name: "Mettre à jour le mot de passe" }).click();
    await a.getByText("Mot de passe mis à jour.").waitFor({ timeout: 15000 });
  });
  await step("A : la déconnexion ferme la session et /app redevient inaccessible", async () => {
    await a.goto(`${BASE}/app/parametres`);
    await a.getByRole("button", { name: "Se déconnecter" }).click();
    await a.waitForURL(/\/connexion/, { timeout: 15000 });
    await a.goto(`${BASE}/app`);
    assert.equal(new URL(a.url()).pathname, "/connexion");
  });
  await step("A : l'ancien mot de passe est refusé, le nouveau fonctionne", async () => {
    await a.goto(`${BASE}/connexion`);
    await a.getByLabel("Adresse e-mail").first().fill(process.env.E2E_A_EMAIL);
    await a.getByLabel("Mot de passe").fill(process.env.E2E_A_PASSWORD);
    await a.getByRole("button", { name: "Se connecter" }).click();
    await a.getByText("E-mail ou mot de passe incorrect.").waitFor({ timeout: 15000 });
    await a.getByLabel("Mot de passe").fill(newPassword);
    await a.getByRole("button", { name: "Se connecter" }).click();
    await a.waitForURL(/\/app$/, { timeout: 15000 });
  });

  // ── Mobile ──
  await step("B (mobile 390 px) : navigation visible, pas de défilement horizontal", async () => {
    const m = await ctxB.newPage();
    await m.setViewportSize({ width: 390, height: 844 });
    await m.goto(`${BASE}/app`);
    await m.getByRole("heading", { name: /^Bonjour/ }).waitFor({ timeout: 15000 });
    assert.equal(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (process.env.E2E_SHOTS) await m.screenshot({ path: `${process.env.E2E_SHOTS}/app-mobile.png` });
  });
  if (process.env.E2E_SHOTS) {
    const d = await ctxB.newPage();
    await d.setViewportSize({ width: 1280, height: 860 });
    for (const [name, path] of [["app-dashboard", "/app"], ["app-abonnement", "/app/abonnement"]]) {
      await d.goto(`${BASE}${path}`);
      await d.locator("h1").first().waitFor({ timeout: 15000 });
      await d.waitForTimeout(400);
      await d.screenshot({ path: `${process.env.E2E_SHOTS}/${name}.png` });
    }
    await anon.goto(`${BASE}/connexion`);
    await anon.screenshot({ path: `${process.env.E2E_SHOTS}/connexion.png` });
  }

  await browser.close();
  for (const r of results) console.log(r.join("  "));
  const failed = results.filter((r) => r[0] === "✗").length;
  console.log(`\n${results.length - failed}/${results.length} réussis`);
  process.exit(failed ? 1 : 0);
})();
