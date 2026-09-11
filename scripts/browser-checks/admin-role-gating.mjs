// Vérifie, dans un vrai navigateur, que la navigation admin est filtrée par
// rôle. Les réponses Supabase (session + admin_access) sont simulées : ce test
// porte sur le comportement de l'interface, pas sur la base.
import { chromium } from 'playwright-core';

const BASE = process.env.BASE || 'http://127.0.0.1:4210';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const results = [];
const record = (id, label, expected, actual, pass) => {
  results.push({ id, pass });
  console.log(`${pass ? '✅' : '❌'} ${id} — ${label}\n     attendu : ${expected}\n     observé : ${actual}`);
};

async function openAs(role, path = '/admin') {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Playwright évalue les routes de la plus récente à la plus ancienne :
  // le filet coupe-tout est enregistré en premier, les cas précis ensuite.
  // Tout ce qui sort vers l'extérieur (polices, analytics) est coupé, sinon la
  // page attend des requêtes qui ne peuvent pas aboutir dans ce conteneur.
  await page.route(/.*/, (route) => {
    const url = route.request().url();
    if (url.startsWith(BASE) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    return route.abort();
  });
  await page.route(/\/auth\/v1\//, (route) => route.fulfill({
    status: 200, headers: { 'content-type': 'application/json' }, body: '{}',
  }));
  await page.route(/\/rest\/v1\//, (route) => route.fulfill({
    status: 200,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    body: '[]',
  }));
  // admin_access : la recherche du profil (filtre email=eq.) attend un objet
  // unique (.maybeSingle), la liste des accès attend un tableau.
  const row = {
    id: 'row-1', email: `${role}@test.local`, role,
    display_name: `Compte ${role}`, active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
  };
  await page.route(/\/rest\/v1\/admin_access/, (route) => route.fulfill({
    status: 200,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    body: JSON.stringify(route.request().url().includes('email=eq.') ? row : [row]),
  }));

  // Session Supabase valide, non expirée.
  await page.addInitScript((r) => {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('gnz-admin-auth', JSON.stringify({
      access_token: 'token-de-test', refresh_token: 'refresh-de-test',
      token_type: 'bearer', expires_in: 3600, expires_at: expires,
      user: { id: 'user-1', email: `${r}@test.local`, aud: 'authenticated', role: 'authenticated' },
    }));
  }, role);

  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  return { ctx, page };
}

// innerText inclut le glyphe d'icône : on lit le libellé porté par le dernier
// <span> du bouton.
const navLabels = (page) => page.$$eval('.gnz-nav-button',
  (els) => els.map((e) => (e.querySelector('span:last-child')?.textContent || e.textContent || '').trim()));

for (const [role, mustSee, mustNotSee] of [
  ['owner',  ['Utilisateurs', 'Paramètres', 'Contenu du site', 'Tableau de bord'], []],
  ['admin',  ['Paramètres', 'Contenu du site', 'Tableau de bord'], ['Utilisateurs']],
  ['editor', ['Contenu du site', 'Tableau de bord'], ['Utilisateurs', 'Paramètres']],
  ['viewer', ['Tableau de bord', 'CRM', 'Réservations'], ['Utilisateurs', 'Paramètres', 'Contenu du site']],
]) {
  const { ctx, page } = await openAs(role);
  const labels = await navLabels(page);
  const missing = mustSee.filter((l) => !labels.includes(l));
  const leaked = mustNotSee.filter((l) => labels.includes(l));
  record(`NAV-${role}`, `navigation vue par un compte ${role}`,
    `contient [${mustSee.join(', ')}], sans [${mustNotSee.join(', ') || '—'}]`,
    `${labels.length} entrées${missing.length ? `, manquantes : ${missing.join(', ')}` : ''}${leaked.length ? `, FUITE : ${leaked.join(', ')}` : ''}`,
    missing.length === 0 && leaked.length === 0);
  await ctx.close();
}

// Accès par URL directe à une section hors du rôle.
for (const role of ['viewer', 'editor', 'admin']) {
  const { ctx, page } = await openAs(role, '/admin/users');
  const txt = await page.evaluate(() => document.body.innerText || '');
  const refused = /n'est pas accessible avec votre rôle/i.test(txt);
  const leakedTable = /Accès autorisés/i.test(txt);
  record(`URL-${role}`, `/admin/users atteint directement par un compte ${role}`,
    'message de refus, aucun module utilisateurs rendu',
    `refus affiché=${refused}, tableau des accès rendu=${leakedTable}`,
    refused === true && leakedTable === false);
  await ctx.close();
}

// L'owner, lui, doit bien obtenir la section.
{
  const { ctx, page } = await openAs('owner', '/admin/users');
  const txt = await page.evaluate(() => document.body.innerText || '');
  record('URL-owner', '/admin/users atteint par le propriétaire',
    'module utilisateurs rendu, aucun refus',
    `refus affiché=${/n'est pas accessible avec votre rôle/i.test(txt)}, module rendu=${/Accès autorisés/i.test(txt)}`,
    /Accès autorisés/i.test(txt) && !/n'est pas accessible avec votre rôle/i.test(txt));
  await ctx.close();
}

await browser.close();
console.log('\n──────── SYNTHÈSE ────────');
const failed = results.filter((r) => !r.pass);
console.log(`${results.length - failed.length}/${results.length} conformes`);
if (failed.length) console.log('ÉCHECS : ' + failed.map((f) => f.id).join(', '));
process.exit(failed.length ? 1 : 0);
