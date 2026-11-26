/**
 * Tests de parcours (navigateur réel) : formulaire, menus, filtres, FAQ, rendu sans JavaScript.
 * Usage : BASE_URL=http://localhost:3000 node scripts/e2e.cjs
 */
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail });

(async () => {
  const browser = await chromium.launch();

  // 1. Formulaire de contact
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    const errs = await page.locator('[id$="-error"]').count();
    check("Formulaire vide : erreurs affichées", errs >= 5, `${errs} erreurs`);
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
    check("Formulaire vide : focus sur le premier champ en erreur", focused === "firstName", focused);
    await page.fill("#firstName", "Camille");
    await page.fill("#lastName", "Test");
    await page.fill("#email", "pas-un-email");
    await page.getByRole("radio", { name: "Création de site internet" }).check();
    await page.fill("#message", "Bonjour, je souhaite un site vitrine pour mon activité de menuiserie dans le Haut-Doubs.");
    await page.check('input[name="consent"]');
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    check("Email invalide détecté", await page.getByText("Cette adresse email ne semble pas valide.").isVisible());
    await page.fill("#email", "camille.test@example.com");
    await page.waitForTimeout(3200); // délai anti-robot
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await page.waitForSelector('form [role="alert"], main [role="status"]', { timeout: 15000 });
    const alert = await page.locator('form [role="alert"]').textContent().catch(() => "");
    const mailto = await page.locator('a[href^="mailto:"]').first().getAttribute("href");
    const configured = Boolean(process.env.RESEND_API_KEY);
    if (configured) check("Envoi réel : confirmation affichée", await page.getByText("Merci, votre message est bien parti.").isVisible());
    else {
      check("Sans configuration : message honnête affiché", /pas encore activé/.test(alert ?? ""), alert?.slice(0, 80));
      check("Sans configuration : lien mailto prérempli", /menuiserie/.test(decodeURIComponent(mailto ?? "")));
      check("Sans configuration : valeurs conservées", (await page.inputValue("#firstName")) === "Camille");
    }
    await page.close();
  }

  // 2. Piège à robots : réponse « envoyé » sans envoi
  {
    const page = await browser.newPage();
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const w = document.querySelector("#website");
      w.value = "http://spam.example";
    });
    await page.fill("#firstName", "Bot");
    await page.fill("#lastName", "Bot");
    await page.fill("#email", "bot@example.com");
    await page.getByRole("radio", { name: "Autre" }).check();
    await page.fill("#message", "Message automatique de test pour le piège à robots du formulaire.");
    await page.check('input[name="consent"]');
    await page.waitForTimeout(3200);
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await page.waitForSelector('[role="status"]', { timeout: 15000 });
    check("Piège à robots : faux succès renvoyé", await page.getByText("Merci, votre message est bien parti.").isVisible());
    await page.close();
  }

  // 3. Menu mobile
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await page.waitForTimeout(800);
    check("Menu mobile : ouverture", await dialog.isVisible());
    const inDialog = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
    check("Menu mobile : focus dans le menu", inDialog);
    const overflow = await page.evaluate(() => document.documentElement.style.overflow);
    check("Menu mobile : défilement de la page bloqué", overflow === "hidden");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(900);
    check("Menu mobile : fermeture par Échap", !(await dialog.isVisible()));
    const back = await page.evaluate(() => document.activeElement?.textContent?.trim());
    check("Menu mobile : focus rendu au bouton", /Menu/.test(back ?? ""), back);
    await toggle.click();
    await page.waitForTimeout(800);
    await dialog.getByRole("link", { name: "Réalisations" }).click();
    await page.waitForURL("**/realisations");
    await page.waitForTimeout(900);
    check("Menu mobile : navigation puis fermeture", !(await dialog.isVisible()));
    await page.close();
  }

  // 4. Menu Services (desktop) + clavier
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const btn = page.locator('header button[aria-expanded]').first();
    await btn.click();
    check("Menu Services : ouverture au clic", (await btn.getAttribute("aria-expanded")) === "true");
    check("Menu Services : 3 prestations", (await page.locator("header nav ul ul a").count()) === 3);
    await page.keyboard.press("Escape");
    check("Menu Services : fermeture par Échap", (await btn.getAttribute("aria-expanded")) === "false");
    // Lien d'évitement (page fraîchement chargée)
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const skip = await page.evaluate(() => document.activeElement?.textContent);
    check("Lien « Aller au contenu » au premier Tab", skip === "Aller au contenu", skip);
    await page.close();
  }

  // 5. Filtre des réalisations + FAQ
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/realisations`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^E-commerce/ }).click();
    await page.waitForTimeout(700);
    check("Filtre E-commerce : 1 projet", (await page.locator("main article").count()) === 1);
    await page.getByRole("button", { name: /^Tous/ }).click();
    await page.waitForTimeout(700);
    check("Filtre Tous : 4 projets", (await page.locator("main article").count()) === 4);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const first = page.locator("details.faq").first();
    await first.locator("summary").click();
    check("FAQ : ouverture d'une question", await first.evaluate((d) => d.open));
    await page.close();
  }

  // 6. Sans JavaScript : contenu visible
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    const op = await page.evaluate(() => getComputedStyle(document.querySelector("[data-reveal]")).opacity);
    check("Sans JavaScript : contenus visibles", op === "1", op);
    check("Sans JavaScript : FAQ lisible", (await page.locator("details.faq").count()) === 8);
    await ctx.close();
  }

  // 7. Mouvement réduit : contenus visibles sans animation
  {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const op = await page.evaluate(() => {
      const el = [...document.querySelectorAll("[data-reveal]")].pop();
      return getComputedStyle(el).opacity;
    });
    check("Mouvement réduit : contenus hors écran déjà visibles", op === "1", op);
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies.`);
  process.exit(failed.length ? 1 : 0);
})();
