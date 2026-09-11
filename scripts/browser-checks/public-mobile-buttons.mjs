import { BASE, isolate, launch, reporter } from "./_helpers.mjs";

const report = reporter();
const browser = await launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
await isolate(page);

await page.addInitScript(() => {
  localStorage.setItem("gnz-lang", "FR");
  localStorage.setItem("gnz-notif-asked", "1");
  localStorage.setItem("gnz-lightMode", "false");
  localStorage.setItem("gnz-highContrast", "false");
  localStorage.setItem("gnz-consent-v1", JSON.stringify({
    version: 1,
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date().toISOString(),
  }));
  window.__gnzOpened = [];
  window.__gnzCookieOpen = 0;
  const originalOpen = window.open.bind(window);
  window.open = (...args) => {
    window.__gnzOpened.push(String(args[0] || ""));
    return null;
  };
  window.addEventListener("gnz:open-cookie-settings", () => {
    window.__gnzCookieOpen += 1;
  });
  window.__gnzOriginalOpen = originalOpen;
});

const jsErrors = [];
page.on("pageerror", (error) => jsErrors.push(error.message));

const wait = (ms) => page.waitForTimeout(ms);

async function home() {
  jsErrors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#gnz-mobile-home", { timeout: 10000 });
  await wait(180);
}

async function activeReady() {
  await page.waitForSelector("#gnz-mobile-active-section", { timeout: 8000 });
  await page.waitForFunction(() => {
    const el = document.getElementById("gnz-mobile-active-section");
    return Boolean(el && el.scrollHeight > 80);
  }, { timeout: 8000 });
}

async function openedUrls() {
  return page.evaluate(() => window.__gnzOpened || []);
}

try {
  await home();

  const introBeforeExplorer = await page.evaluate(() => {
    const intro = document.querySelector('img[alt*="Inspirateur"]')?.closest("section");
    const explorer = document.querySelector("#gnz-mobile-home");
    if (!intro || !explorer) return false;
    return Boolean(intro.compareDocumentPosition(explorer) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  report.record("PUB-01", "Présentation avant Explorer l’univers", "la présentation de Gaspard précède Explorer", `ordre correct=${introBeforeExplorer}`, introBeforeExplorer);

  const relaxedVisible = await page.getByText("DÉCONTRACTÉ", { exact: true }).count();
  report.record("PUB-02", "Bloc Décontracté retiré du mobile", "aucun grand bloc Décontracté sur l'accueil mobile", `occurrences=${relaxedVisible}`, relaxedVisible === 0);

  const partnersBeforeExplorer = await page.evaluate(() => {
    const heading = [...document.querySelectorAll("h2")].find((el) => /Nos Partenaires/i.test(el.textContent || ""));
    const explorer = document.querySelector("#gnz-mobile-home");
    if (!heading || !explorer) return false;
    return heading.getBoundingClientRect().top < explorer.getBoundingClientRect().top;
  });
  report.record("PUB-03", "Partenaires visibles avant Explorer", "Nos Partenaires est présenté avant Explorer", `ordre correct=${partnersBeforeExplorer}`, partnersBeforeExplorer);

  // Hero CTA
  const hero = page.locator("section").first();
  const heroButtons = hero.locator("button");
  const heroCount = await heroButtons.count();
  if (heroCount > 0) {
    const heroCta = heroButtons.nth(heroCount - 1);
    await heroCta.click({ force: true });
    await wait(700);
    const explorerTop = await page.locator("#gnz-mobile-home").evaluate((el) => el.getBoundingClientRect().top);
    report.record("PUB-04", "CTA du Hero", "le bouton fait avancer vers le contenu", `Explorer top=${Math.round(explorerTop)}px`, explorerTop < 950);
  } else {
    report.record("PUB-04", "CTA du Hero", "un bouton CTA est présent", "aucun bouton", false);
  }

  // CTA commercial principal
  await home();
  await page.getByRole("button", { name: "Découvrir les formules" }).click({ force: true });
  await activeReady();
  const formulaPressed = await page.locator("#gnz-mobile-home button[aria-pressed='true']").filter({ hasText: "Formules" }).count();
  report.record("PUB-05", "Découvrir les formules", "ouvre la section Formules", `bouton Formules actif=${formulaPressed > 0}`, formulaPressed > 0 && jsErrors.length === 0);

  await home();
  const wa = page.getByRole("link", { name: "Parler à Gaspard" });
  const waHref = await wa.getAttribute("href");
  report.record("PUB-06", "Parler à Gaspard", "lien WhatsApp wa.me avec message", waHref || "href absent", Boolean(waHref?.startsWith("https://wa.me/")));

  // Partenaires : aperçu -> section complète
  await page.getByRole("button", { name: "Voir tous nos partenaires" }).click({ force: true });
  await activeReady();
  const partnersFull = await page.locator("#gnz-mobile-active-section").getByText(/Nos Partenaires/i).count();
  report.record("PUB-07", "Voir tous nos partenaires", "ouvre la section partenaires complète", `section partenaires=${partnersFull > 0}`, partnersFull > 0 && jsErrors.length === 0);

  // Tous les boutons Explorer l'univers
  const explorerLabels = [
    "Formules",
    "Les Looks",
    "Mariage",
    "Style du mois",
    "Style Journal",
    "La Maison",
    "Vidéos",
    "Actualités",
    "Partenaires",
    "VIP",
    "Communauté",
  ];

  for (let i = 0; i < explorerLabels.length; i += 1) {
    const label = explorerLabels[i];
    await home();
    const explorer = page.locator("#gnz-mobile-home");
    const button = explorer.getByRole("button", { name: label, exact: true });
    await button.click({ force: true });
    let ok = true;
    try {
      await activeReady();
    } catch {
      ok = false;
    }
    const pressed = await button.getAttribute("aria-pressed");
    const activeHeight = await page.locator("#gnz-mobile-active-section").count()
      ? await page.locator("#gnz-mobile-active-section").evaluate((el) => el.scrollHeight)
      : 0;
    ok = ok && pressed === "true" && activeHeight > 80 && jsErrors.length === 0;
    report.record(`EXP-${String(i + 1).padStart(2, "0")}`, `Explorer — ${label}`, "ouvre sa section sans erreur JavaScript", `pressed=${pressed}, hauteur=${activeHeight}px, erreurs=${jsErrors.length}`, ok);

    const close = explorer.getByRole("button", { name: "Fermer la section", exact: true });
    if (await close.count()) {
      await close.click({ force: true });
      await wait(120);
      const closed = await page.locator("#gnz-mobile-active-section").count() === 0;
      report.record(`EXP-CLOSE-${String(i + 1).padStart(2, "0")}`, `Fermer — ${label}`, "referme la section active", `fermée=${closed}`, closed);
    }
  }

  // Langues
  await home();
  const languageButton = page.locator("nav button[aria-expanded]").filter({ hasText: "FR" }).first();
  await languageButton.click({ force: true });
  const enButton = page.locator("nav button").filter({ hasText: /^EN$/ }).last();
  await enButton.click({ force: true });
  await page.waitForFunction(() => document.querySelector("#gnz-mobile-home")?.textContent?.includes("Explore the universe"));
  const englishVisible = await page.locator("#gnz-mobile-home").getByText("Explore the universe", { exact: true }).count();
  report.record("NAV-01", "Sélecteur de langue", "FR -> EN met bien à jour la page", `titre anglais=${englishVisible > 0}`, englishVisible > 0 && jsErrors.length === 0);

  // Shop / boutique
  await home();
  await page.locator("nav button").filter({ hasText: "SHOP" }).click({ force: true });
  await wait(180);
  const shopOverlay = await page.locator('div[style*="z-index: 500"]').count();
  report.record("NAV-02", "Bouton SHOP", "ouvre la boutique / modal", `overlay=${shopOverlay}`, shopOverlay > 0 && jsErrors.length === 0);

  // Menu ouvert
  await home();
  const menuToggle = page.locator("nav button").filter({ hasText: "MENU" });
  await menuToggle.click({ force: true });
  await wait(120);
  const menuOverlay = page.locator('div[style*="z-index: 699"]').first();
  const menuVisible = await menuOverlay.isVisible().catch(() => false);
  const menuButtonCount = menuVisible ? await menuOverlay.locator("button").count() : 0;
  report.record("NAV-03", "Ouverture du menu", "menu visible avec toutes ses commandes", `visible=${menuVisible}, boutons=${menuButtonCount}`, menuVisible && menuButtonCount >= 19);

  // Tous les boutons principaux du menu, par ordre défini dans NavMobile.
  const menuExpect = [
    { kind: "dialog", key: "booking", label: "Réserver" },
    { kind: "section", key: "heritage", label: "Biographie" },
    { kind: "section", key: "formules", label: "Formules" },
    { kind: "section", key: "journal", label: "Style Journal" },
    { kind: "section", key: "gallery", label: "Galerie" },
    { kind: "section", key: "video", label: "Vidéos" },
    { kind: "section", key: "wedding", label: "Mariage" },
    { kind: "section", key: "partners", label: "Partenaires" },
    { kind: "section", key: "news", label: "Actualités" },
    { kind: "section", key: "vip", label: "Galerie clients" },
    { kind: "showroom", key: "showroom", label: "Showroom" },
    { kind: "section", key: "styleMonth", label: "Style du mois" },
    { kind: "section", key: "community", label: "Communauté" },
    { kind: "external", key: "lookbook", label: "Lookbook" },
  ];

  for (let i = 0; i < menuExpect.length; i += 1) {
    const item = menuExpect[i];
    await home();
    await page.locator("nav button").filter({ hasText: "MENU" }).click({ force: true });
    await wait(80);
    const overlay = page.locator('div[style*="z-index: 699"]').first();
    const navButtons = overlay.locator("button");
    const button = navButtons.nth(i);
    const actualLabel = (await button.innerText()).replace(/\s+/g, " ").trim();
    await button.click({ force: true });
    await wait(item.kind === "showroom" ? 850 : 220);

    let ok = jsErrors.length === 0;
    let observed = "";
    if (item.kind === "dialog") {
      const dialog = await page.getByRole("dialog").count();
      ok = ok && dialog > 0;
      observed = `dialog=${dialog}`;
    } else if (item.kind === "section") {
      try { await activeReady(); } catch { ok = false; }
      const active = await page.locator("#gnz-mobile-active-section").count();
      ok = ok && active > 0;
      observed = `section active=${active}`;
    } else if (item.kind === "showroom") {
      const showroom = page.locator("section").filter({ hasText: /SHOWROOM/i }).last();
      const top = await showroom.count() ? await showroom.evaluate((el) => el.getBoundingClientRect().top) : 99999;
      ok = ok && top < 900;
      observed = `top showroom=${Math.round(top)}px`;
    } else if (item.kind === "external") {
      const urls = await openedUrls();
      const last = urls.at(-1) || "";
      ok = ok && /^https?:\/\//.test(last);
      observed = `url=${last || "aucune"}`;
    }
    report.record(`MENU-${String(i + 1).padStart(2, "0")}`, `Menu — ${item.label}`, "le bouton déclenche l'action attendue", `texte="${actualLabel}", ${observed}`, ok);
  }

  // Bouton Boutique dans le panneau menu (après les 14 entrées principales)
  await home();
  await page.locator("nav button").filter({ hasText: "MENU" }).click({ force: true });
  await wait(80);
  const overlay = page.locator('div[style*="z-index: 699"]').first();
  const allMenuButtons = overlay.locator("button");
  const boutiqueButton = allMenuButtons.nth(14);
  await boutiqueButton.click({ force: true });
  await wait(180);
  const boutiqueOverlay = await page.locator('div[style*="z-index: 500"]').count();
  report.record("MENU-15", "Menu — Boutique", "ouvre la modal Boutique", `overlay=${boutiqueOverlay}`, boutiqueOverlay > 0 && jsErrors.length === 0);

  // Showroom CTA
  await home();
  const showroomSection = page.locator("section").filter({ hasText: /SHOWROOM/i }).last();
  const showroomButtons = showroomSection.locator("button");
  const showroomButtonCount = await showroomButtons.count();
  if (showroomButtonCount > 0) {
    await showroomButtons.nth(showroomButtonCount - 1).click({ force: true });
    await wait(180);
    const overlayCount = await page.locator('div[style*="z-index: 500"]').count();
    report.record("SHOWROOM-01", "CTA Showroom", "ouvre la boutique", `overlay=${overlayCount}`, overlayCount > 0 && jsErrors.length === 0);
  } else {
    report.record("SHOWROOM-01", "CTA Showroom", "un CTA est présent", "aucun bouton", false);
  }

  // Footer : commandes internes, réseaux et cookies
  await home();
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const footerButtons = footer.locator("button");
  const footerCount = await footerButtons.count();
  report.record("FOOT-00", "Footer — présence des commandes", "au moins 6 boutons", `boutons=${footerCount}`, footerCount >= 6);

  // Showroom depuis footer
  let beforeY = await page.evaluate(() => window.scrollY);
  await footerButtons.nth(0).click({ force: true });
  await wait(700);
  let afterY = await page.evaluate(() => window.scrollY);
  report.record("FOOT-01", "Footer — Showroom", "remonte vers le showroom", `scroll ${Math.round(beforeY)} -> ${Math.round(afterY)}`, afterY < beforeY);

  // Galerie depuis footer
  await home();
  const footer2 = page.locator("footer");
  await footer2.scrollIntoViewIfNeeded();
  await footer2.locator("button").nth(1).click({ force: true });
  await activeReady();
  report.record("FOOT-02", "Footer — Galerie", "ouvre la galerie", `section active=${await page.locator("#gnz-mobile-active-section").count()}`, jsErrors.length === 0);

  // Formules depuis footer
  await home();
  const footer3 = page.locator("footer");
  await footer3.scrollIntoViewIfNeeded();
  await footer3.locator("button").nth(2).click({ force: true });
  await activeReady();
  report.record("FOOT-03", "Footer — Formules", "ouvre les formules", `section active=${await page.locator("#gnz-mobile-active-section").count()}`, jsErrors.length === 0);

  // Instagram / TikTok via window.open
  await home();
  const footer4 = page.locator("footer");
  await footer4.scrollIntoViewIfNeeded();
  await footer4.locator("button").nth(3).click({ force: true });
  await wait(60);
  let urls = await openedUrls();
  let last = urls.at(-1) || "";
  report.record("FOOT-04", "Footer — Instagram", "ouvre une URL Instagram", last, /instagram/i.test(last));

  await footer4.locator("button").nth(4).click({ force: true });
  await wait(60);
  urls = await openedUrls();
  last = urls.at(-1) || "";
  report.record("FOOT-05", "Footer — TikTok", "ouvre une URL TikTok", last, /tiktok/i.test(last));

  await footer4.locator("button").nth(5).click({ force: true });
  await wait(80);
  const cookieOpened = await page.evaluate(() => window.__gnzCookieOpen || 0);
  const cookieDialog = await page.getByRole("dialog").count();
  report.record("FOOT-06", "Footer — Gérer les cookies", "ouvre les préférences cookies", `événement=${cookieOpened}, dialog=${cookieDialog}`, cookieOpened > 0 && cookieDialog > 0);

  const footerLinks = footer4.locator("a[href]");
  const footerLinkCount = await footerLinks.count();
  let validFooterLinks = true;
  const invalidHrefs = [];
  for (let i = 0; i < footerLinkCount; i += 1) {
    const href = await footerLinks.nth(i).getAttribute("href");
    if (!href || (!href.startsWith("/") && !href.startsWith("http"))) {
      validFooterLinks = false;
      invalidHrefs.push(href || "(vide)");
    }
  }
  report.record("FOOT-07", "Footer — liens", "tous les liens ont une destination valide", `liens=${footerLinkCount}, invalides=${invalidHrefs.join(",") || "aucun"}`, validFooterLinks && footerLinkCount >= 7);

  // Chatbot : ouverture et fermeture
  await home();
  const chatOpen = page.locator('button[aria-label*="assistant Gaspard NZ"]').first();
  await chatOpen.click({ force: true });
  await wait(520);
  const chatClose = page.getByRole("button", { name: /Fermer l'assistant/i }).first();
  const chatOpened = await chatClose.count();
  report.record("CHAT-01", "Assistant — ouverture", "le bouton ouvre l'assistant", `bouton fermer=${chatOpened}`, chatOpened > 0 && jsErrors.length === 0);
  if (chatOpened) {
    await chatClose.click({ force: true });
    await wait(100);
    const closedLabel = await page.locator('button[aria-label*="Ouvrir l\'assistant"]').count();
    report.record("CHAT-02", "Assistant — fermeture", "le bouton ferme l'assistant", `bouton ouvrir=${closedLabel}`, closedLabel > 0);
  }

  report.record("PUB-JS", "Erreurs JavaScript publiques", "aucune erreur non gérée pendant les parcours", jsErrors.length ? jsErrors.join(" | ") : "aucune", jsErrors.length === 0);
} finally {
  await browser.close();
}

report.finish();
