import { BASE, isolate, launch, reporter } from "./_helpers.mjs";

const report = reporter();
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
await isolate(page);

await page.addInitScript(() => {
  localStorage.setItem("gnz-lang", "FR");
  localStorage.setItem("gnz-notif-asked", "1");
  localStorage.setItem("gnz-lightMode", "false");
  localStorage.setItem("gnz-highContrast", "false");
  localStorage.setItem("gnz-consent-v1", JSON.stringify({ version: 1, necessary: true, analytics: false, marketing: false, updatedAt: new Date().toISOString() }));
  window.__gnzOpened = [];
  window.open = (...args) => { window.__gnzOpened.push(String(args[0] || "")); return null; };
  if (!navigator.clipboard) Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true });
});

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const wait = (ms = 120) => page.waitForTimeout(ms);
const opened = () => page.evaluate(() => window.__gnzOpened || []);

async function home() {
  errors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#gnz-mobile-home", { timeout: 10000 });
  await wait(120);
}

async function openSection(label) {
  await home();
  await page.locator("#gnz-mobile-home").getByRole("button", { name: label, exact: true }).click({ force: true });
  await page.waitForSelector("#gnz-mobile-active-section", { timeout: 8000 });
  await page.waitForFunction(() => document.getElementById("gnz-mobile-active-section")?.scrollHeight > 80, { timeout: 8000 });
  return page.locator("#gnz-mobile-active-section");
}

try {
  // GALERIE — navigation, expansion, partage et hotspot.
  let section = await openSection("Les Looks");
  const galleryCounter = section.locator("span").filter({ hasText: /\d{2}\s*\/\s*\d{2}/ }).first();
  const beforeCounter = (await galleryCounter.textContent())?.trim() || "";
  const next = section.locator("button").filter({ hasText: "›" }).first();
  await next.click({ force: true }); await wait();
  const afterCounter = (await galleryCounter.textContent())?.trim() || "";
  report.record("DEEP-GAL-01", "Galerie — suivant", "la photo suivante est sélectionnée", `${beforeCounter} -> ${afterCounter}`, beforeCounter !== afterCounter && errors.length === 0);

  const prev = section.locator("button").filter({ hasText: "‹" }).first();
  await prev.click({ force: true }); await wait();
  const backCounter = (await galleryCounter.textContent())?.trim() || "";
  report.record("DEEP-GAL-02", "Galerie — précédent", "retour à la photo précédente", `${afterCounter} -> ${backCounter}`, backCounter === beforeCounter && errors.length === 0);

  const expandGallery = section.getByRole("button", { name: /Voir tous les looks/i });
  if (await expandGallery.count()) {
    await expandGallery.click({ force: true }); await wait();
    const collapse = section.getByRole("button", { name: /Réduire la galerie/i });
    report.record("DEEP-GAL-03", "Galerie — voir tous les looks", "le bouton développe puis propose de réduire", `réduire visible=${await collapse.count() > 0}`, await collapse.count() > 0 && errors.length === 0);
    await collapse.click({ force: true }); await wait();
    report.record("DEEP-GAL-04", "Galerie — réduire", "le bouton revient à l'état compact", `voir tous visible=${await section.getByRole("button", { name: /Voir tous les looks/i }).count() > 0}`, await section.getByRole("button", { name: /Voir tous les looks/i }).count() > 0);
  }

  const share = section.getByRole("button", { name: /Partager ce look/i });
  await share.click({ force: true }); await wait(60);
  report.record("DEEP-GAL-05", "Galerie — partager", "le bouton s'exécute sans erreur", `erreurs=${errors.length}`, errors.length === 0);

  const galleryHotspots = section.locator("button[aria-pressed]");
  if (await galleryHotspots.count()) {
    await galleryHotspots.first().click({ force: true }); await wait();
    const dialog = page.getByRole("dialog").last();
    const action = dialog.getByRole("button", { name: /Demander à Gaspard/i });
    const dialogOk = await dialog.count() > 0 && await action.count() > 0;
    if (dialogOk) { await action.click({ force: true }); await wait(50); }
    const urls = await opened();
    report.record("DEEP-GAL-06", "Galerie — hotspot", "ouvre le détail puis WhatsApp", `dialog=${dialogOk}, url=${urls.at(-1) || "aucune"}`, dialogOk && /wa\.me/.test(urls.at(-1) || "") && errors.length === 0);
  }

  // STYLE JOURNAL — expansion + hotspot.
  section = await openSection("Style Journal");
  const openJournal = section.getByRole("button", { name: /Voir le journal/i });
  if (await openJournal.count()) {
    await openJournal.click({ force: true }); await wait();
    const collapseJournal = section.getByRole("button", { name: /Réduire le journal/i });
    report.record("DEEP-JOURNAL-01", "Style Journal — développer", "affiche le journal complet", `réduire visible=${await collapseJournal.count() > 0}`, await collapseJournal.count() > 0 && errors.length === 0);
  }
  const journalHotspots = section.locator("button[aria-pressed]");
  if (await journalHotspots.count()) {
    await journalHotspots.first().click({ force: true }); await wait();
    const dialog = page.getByRole("dialog").last();
    const buttons = dialog.locator("button");
    const ok = await dialog.count() > 0 && await buttons.count() >= 2;
    if (ok) { await buttons.first().click({ force: true }); await wait(50); }
    const urls = await opened();
    report.record("DEEP-JOURNAL-02", "Style Journal — hotspot", "ouvre le détail et l'action WhatsApp", `dialog=${ok}, url=${urls.at(-1) || "aucune"}`, ok && /wa\.me/.test(urls.at(-1) || "") && errors.length === 0);
  }

  // VIDÉOS — changement de format + son si le contrôle est disponible.
  section = await openSection("Vidéos");
  const fullVideo = section.getByRole("button", { name: /Voir la vidéo en plein format/i });
  await fullVideo.click({ force: true }); await wait();
  const reduceVideo = section.getByRole("button", { name: /Réduire la vidéo/i });
  report.record("DEEP-VID-01", "Vidéo — plein format", "le format peut être développé", `réduire visible=${await reduceVideo.count() > 0}`, await reduceVideo.count() > 0 && errors.length === 0);
  await reduceVideo.click({ force: true }); await wait();
  report.record("DEEP-VID-02", "Vidéo — réduire", "revient au format compact", `plein format visible=${await section.getByRole("button", { name: /Voir la vidéo en plein format/i }).count() > 0}`, await section.getByRole("button", { name: /Voir la vidéo en plein format/i }).count() > 0 && errors.length === 0);
  const soundButton = section.getByRole("button", { name: /Activer le son/i });
  if (await soundButton.count()) {
    await soundButton.click({ force: true }); await wait(80);
    report.record("DEEP-VID-03", "Vidéo — son", "le contrôle de son répond au clic", `erreurs=${errors.length}`, errors.length === 0);
  }

  // MARIAGE — expansion + navigation album + hotspot si disponible.
  section = await openSection("Mariage");
  const allWedding = section.getByRole("button", { name: /Voir toutes les inspirations/i });
  if (await allWedding.count()) {
    await allWedding.click({ force: true }); await wait();
    const reduceWedding = section.getByRole("button", { name: /Réduire les inspirations/i });
    report.record("DEEP-WED-01", "Mariage — toutes les inspirations", "développe la section", `réduire visible=${await reduceWedding.count() > 0}`, await reduceWedding.count() > 0 && errors.length === 0);
  }
  const weddingThumbs = section.locator('button[aria-label*="photo" i], button[aria-label*="voir" i]');
  if (await weddingThumbs.count()) {
    await weddingThumbs.last().click({ force: true }); await wait();
    report.record("DEEP-WED-02", "Mariage — album", "une miniature de l'album répond au clic", `miniatures=${await weddingThumbs.count()}`, errors.length === 0);
  }
  const weddingHotspots = section.locator("button[aria-pressed]");
  if (await weddingHotspots.count()) {
    await weddingHotspots.first().click({ force: true }); await wait();
    const dialog = page.getByRole("dialog").last();
    const buttons = dialog.locator("button");
    const ok = await dialog.count() > 0 && await buttons.count() >= 2;
    if (ok) { await buttons.first().click({ force: true }); await wait(50); }
    const urls = await opened();
    report.record("DEEP-WED-03", "Mariage — hotspot", "ouvre le détail et l'action WhatsApp", `dialog=${ok}, url=${urls.at(-1) || "aucune"}`, ok && /wa\.me/.test(urls.at(-1) || "") && errors.length === 0);
  }

  // FORMULES — chaque accordéon, CTA WhatsApp et lookbook.
  section = await openSection("Formules");
  const accordions = section.locator("button[aria-expanded]");
  const accordionCount = await accordions.count();
  let accordionOk = accordionCount >= 2;
  for (let i = 0; i < accordionCount; i += 1) {
    const btn = accordions.nth(i);
    await btn.click({ force: true }); await wait();
    const expanded = await btn.getAttribute("aria-expanded");
    accordionOk = accordionOk && expanded === "true";
    const card = btn.locator("xpath=..");
    const contact = card.locator('button[data-track="booking_click"]');
    if (await contact.count()) {
      const before = (await opened()).length;
      await contact.click({ force: true }); await wait(50);
      const urls = await opened();
      accordionOk = accordionOk && urls.length > before && /wa\.me/.test(urls.at(-1) || "");
    }
    await btn.click({ force: true }); await wait(60);
  }
  report.record("DEEP-FORM-01", "Formules — accordéons et CTA", "chaque formule s'ouvre/se ferme et son CTA ouvre WhatsApp", `accordéons=${accordionCount}`, accordionOk && errors.length === 0);

  const lookbook = section.locator("button").filter({ hasText: /lookbook/i }).last();
  if (await lookbook.count()) {
    const before = (await opened()).length;
    await lookbook.click({ force: true }); await wait(50);
    const urls = await opened();
    const last = urls.at(-1) || "";
    report.record("DEEP-FORM-02", "Formules — Lookbook", "ouvre le paiement ou le fallback WhatsApp", last, urls.length > before && /^(https?:\/\/)/.test(last) && errors.length === 0);
  }

  // PARTENAIRES — prise de contact et fermeture de modal.
  section = await openSection("Partenaires");
  const partnerContact = section.getByRole("button", { name: /Prendre Contact/i }).first();
  if (await partnerContact.count()) {
    await partnerContact.click({ force: true }); await wait();
    const dialog = page.getByRole("dialog").last();
    const close = dialog.getByRole("button", { name: /Close dialog/i });
    const modalOk = await dialog.count() > 0 && await close.count() > 0;
    report.record("DEEP-PARTNER-01", "Partenaires — Prendre contact", "ouvre le formulaire partenaire", `dialog=${modalOk}`, modalOk && errors.length === 0);
    if (modalOk) {
      await close.click({ force: true }); await wait(80);
      report.record("DEEP-PARTNER-02", "Partenaires — fermer", "ferme le formulaire partenaire", `dialogs=${await page.getByRole("dialog").count()}`, await page.getByRole("dialog").count() === 0);
    }
  }

  // ACTUALITÉS — navigation et lecture étendue si disponible.
  section = await openSection("Actualités");
  const newsCounter = section.locator('[aria-live="polite"]').first();
  const newsBefore = (await newsCounter.textContent())?.trim() || "";
  const newsNext = section.locator("button").filter({ hasText: "›" }).first();
  await newsNext.click({ force: true }); await wait(380);
  const newsAfter = (await newsCounter.textContent())?.trim() || "";
  report.record("DEEP-NEWS-01", "Actualités — suivant", "passe à l'actualité suivante", `${newsBefore} -> ${newsAfter}`, newsBefore !== newsAfter && errors.length === 0);
  const readMore = section.locator("button").filter({ hasText: /Lire la suite|Read more|Leer más/i }).first();
  if (await readMore.count()) {
    await readMore.click({ force: true }); await wait(80);
    const reduce = section.locator("button").filter({ hasText: /Réduire|Reduce|Reducir/i }).first();
    report.record("DEEP-NEWS-02", "Actualités — lire la suite", "développe le texte puis permet de réduire", `réduire visible=${await reduce.count() > 0}`, await reduce.count() > 0 && errors.length === 0);
  }

  report.record("DEEP-JS", "Actions internes — erreurs JavaScript", "aucune erreur non gérée", errors.length ? errors.join(" | ") : "aucune", errors.length === 0);
} finally {
  await browser.close();
}

report.finish();
