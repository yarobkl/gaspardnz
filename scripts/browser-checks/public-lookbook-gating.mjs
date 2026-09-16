// Vérifie, dans un vrai navigateur, que le bouton d'achat du lookbook (lien
// Stripe) est remplacé par « À venir » tant qu'aucun lien n'est enregistré, et
// redevient actif dès qu'un lien Stripe est présent dans les réglages publics.
import { chromium } from 'playwright-core';
import { isolate, BASE, launch, reporter } from './_helpers.mjs';

const browser = await launch();
const { record, finish } = reporter();

async function open({ stripeUrl, hidden = false, hiddenMessage = "" }) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await isolate(page);

  await page.route(/\/auth\/v1\//, (route) => route.fulfill({
    status: 200, headers: { 'content-type': 'application/json' }, body: '{}',
  }));
  // Playwright priorise la route enregistrée EN DERNIER : le filet générique
  // doit être posé AVANT le cas particulier site_settings, sinon il l'emporte
  // et la réponse spécifique n'est jamais servie.
  await page.route(/\/rest\/v1\//, (route) => route.fulfill({
    status: 200,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    body: '[]',
  }));
  await page.route(/\/rest\/v1\/site_settings/, (route) => route.fulfill({
    status: 200,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    body: JSON.stringify([
      { key: 'payment', value: stripeUrl
        ? { stripe_payment_url: stripeUrl, payment_label: 'Acheter le lookbook', lookbook_hidden: hidden, lookbook_hidden_message: hiddenMessage }
        : {} },
    ]),
  }));

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  return { ctx, page };
}

async function readFormulesState(page) {
  // La section Formules est chargée en différé : on force son montage en
  // suivant le même chemin qu'un visiteur (clic sur « Formules » dans la
  // grille d'accueil), comme public-mobile-buttons.mjs le fait déjà ailleurs.
  const opened = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /formules/i.test(b.innerText));
    if (!btn) return false;
    btn.click();
    return true;
  });
  if (!opened) return null;
  await page.waitForTimeout(1200);
  return page.evaluate(() => {
    // Se limiter au bloc lookbook : « à venir » existe ailleurs sur la page
    // (ex. les photos d'inspiration mariage pas encore prêtes), un test qui
    // lirait document.body.innerText entier ne prouverait rien de spécifique
    // au bouton Stripe.
    const heading = [...document.querySelectorAll('h3')].find((h) => /lookbook/i.test(h.textContent));
    const block = heading?.closest('div') || document.body;
    const txt = block.innerText || '';
    return {
      soon: /à venir/i.test(txt),
      buyLabel: /acheter le lookbook/i.test(txt),
      texte: txt.replace(/\s+/g, ' ').trim(),
    };
  });
}

async function readNavState(page) {
  await page.getByRole('button', { name: /ouvrir le menu|menu/i }).first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(600);
  return page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /lookbook/i.test(b.innerText));
    if (!btn) return null;
    return {
      texte: btn.innerText.replace(/\s+/g, ' ').trim(),
      desactive: btn.disabled === true,
    };
  });
}

// ---------- Sans lien Stripe ----------
{
  const { ctx, page } = await open({ stripeUrl: '' });
  const formules = await readFormulesState(page);
  record('FORMULES-vide', "section Formules sans lien Stripe",
    '« À venir » affiché, pas de bouton d\'achat',
    JSON.stringify(formules),
    Boolean(formules?.soon) && !formules?.buyLabel);

  const nav = await readNavState(page);
  record('NAV-vide', "entrée Lookbook du menu sans lien Stripe",
    'texte contenant « à venir », bouton désactivé',
    JSON.stringify(nav),
    Boolean(nav && /à venir/i.test(nav.texte) && nav.desactive));
  await ctx.close();
}

// ---------- Avec lien Stripe ----------
{
  const { ctx, page } = await open({ stripeUrl: 'https://buy.stripe.com/test_exemple' });
  const formules = await readFormulesState(page);
  record('FORMULES-actif', "section Formules avec lien Stripe",
    'bouton d\'achat affiché, pas de « À venir »',
    JSON.stringify(formules),
    Boolean(formules?.buyLabel) && !formules?.soon);

  const nav = await readNavState(page);
  record('NAV-actif', "entrée Lookbook du menu avec lien Stripe",
    'badge prix « € · Stripe », bouton actif',
    JSON.stringify(nav),
    Boolean(nav && /€ · Stripe/i.test(nav.texte) && !nav.desactive));
  await ctx.close();
}

// ---------- Lien Stripe présent, mais masqué manuellement ----------
{
  const { ctx, page } = await open({ stripeUrl: 'https://buy.stripe.com/test_exemple', hidden: true, hiddenMessage: 'Bientôt disponible' });
  const formules = await readFormulesState(page);
  record('FORMULES-masque-manuel', "section Formules avec lien Stripe mais case « Masquer » cochée",
    'message personnalisé « Bientôt disponible » affiché, pas de bouton d\'achat',
    JSON.stringify(formules),
    !formules?.buyLabel && /bientôt disponible/i.test(formules?.texte || ''));

  const nav = await readNavState(page);
  record('NAV-masque-manuel', "entrée Lookbook du menu, masquée manuellement",
    'texte contenant le message personnalisé, bouton désactivé',
    JSON.stringify(nav),
    Boolean(nav && /bientôt disponible/i.test(nav.texte) && nav.desactive));
  await ctx.close();
}

await browser.close();
finish();
