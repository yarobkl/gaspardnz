import { BASE, isolate, launch, reporter } from "./_helpers.mjs";
const report = reporter();
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
await isolate(page);
await page.addInitScript(() => {
  localStorage.setItem("gnz-lang", "FR");
  localStorage.setItem("gnz-notif-asked", "1");
  localStorage.setItem("gnz-consent-v1", JSON.stringify({ version: 1, necessary: true, analytics: false, marketing: false }));
});
const errors = [];
page.on("pageerror", error => errors.push(error.message));
async function home() {
  errors.length = 0;
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.locator("#gnz-mobile-home").waitFor();
}
try {
  await home();
  const explorer = page.locator("#gnz-mobile-home");
  report.record("MOBILE-HOME", "Accueil compact", "la grille Explorer est présente", "visible=" + await explorer.isVisible(), await explorer.isVisible());
  const labels = ["Formules", "Les Looks", "Mariage", "Style du mois", "Style Journal", "La Maison", "Vidéos", "Actualités", "Partenaires", "Habillés par GaspardNZ", "Communauté"];
  for (const label of labels) {
    await home();
    const button = page.locator("#gnz-mobile-home").getByRole("button", { name: label, exact: true });
    await button.click({ force: true });
    const active = page.locator("#gnz-mobile-active-section");
    const shown = await active.waitFor({ state: "visible", timeout: 9000 }).then(() => true).catch(() => false);
    const pressed = await button.getAttribute("aria-pressed").catch(() => null);
    report.record("EXP-" + label, "Explorer — " + label, "la section s'ouvre", "visible=" + shown + ", pressed=" + pressed, shown && pressed === "true" && errors.length === 0);
    const close = page.locator("#gnz-mobile-home").getByRole("button", { name: "Fermer la section" });
    if (await close.count()) {
      await close.click({ force: true });
      const closed = await active.count() === 0;
      report.record("CLOSE-" + label, "Fermer — " + label, "la section se referme", "fermée=" + closed, closed);
    }
  }
  await home();
  const menuToggle = page.locator("nav button").filter({ hasText: "MENU" }).first();
  await menuToggle.click({ force: true });
  const menu = page.locator('div[style*="z-index: 699"]').first();
  const visible = await menu.isVisible();
  const menuText = await menu.innerText();
  report.record("MENU-COMPACT", "Menu mobile réduit", "Rendez-vous et Showroom, sans Lookbook", menuText.replace(/\\s+/g, " ").slice(0,180), visible && /rendez-vous/i.test(menuText) && /showroom/i.test(menuText) && !/lookbook/i.test(menuText));
  await home();
  const shop = page.locator("nav button").filter({ hasText: "SHOP" }).first();
  await shop.click({ force: true });
  const shopVisible = await page.getByText(/bientôt disponible/i).count() > 0 || await page.getByRole("dialog").count() > 0;
  report.record("SHOP", "Boutique", "le bouton ouvre la boutique", "visible=" + shopVisible, shopVisible);
} finally {
  await context.close();
  await browser.close();
}
report.finish();
