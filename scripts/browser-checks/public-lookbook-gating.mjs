// Le lookbook est archivé : aucun CTA public, même si d'anciens réglages Stripe subsistent.
import { isolate, BASE, launch, reporter } from './_helpers.mjs';
const browser = await launch();
const report = reporter();
for (const stripeUrl of ['', 'https://buy.stripe.com/test_exemple']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await isolate(page);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#gnz-mobile-home').waitFor();
  await page.getByRole('button', { name: 'Formules', exact: true }).first().click();
  await page.locator('#gnz-mobile-active-section').waitFor();
  const section = page.locator('#gnz-mobile-active-section');
  const purchase = await section.getByRole('button', { name: /acheter le lookbook/i }).count();
  const links = await section.getByRole('link', { name: /lookbook/i }).count();
  report.record('LOOKBOOK-ARCHIVE-FORMULES-' + (stripeUrl ? 'ancien-stripe' : 'vide'), 'Lookbook archivé dans Formules', 'aucun bouton d’achat ou téléchargement', 'boutons=' + purchase + ', liens=' + links, purchase === 0 && links === 0);
  await page.locator('nav button').filter({ hasText: 'MENU' }).first().click();
  const menu = page.locator('div[style*="z-index: 699"]').first();
  const nav = await menu.getByRole('button', { name: /lookbook/i }).count();
  report.record('LOOKBOOK-ARCHIVE-MENU-' + (stripeUrl ? 'ancien-stripe' : 'vide'), 'Lookbook archivé dans le menu', 'aucune entrée Lookbook', 'entrées=' + nav, nav === 0);
  await context.close();
}
await browser.close();
report.finish();
