import { chromium } from 'playwright-core';
import { isolate } from './_helpers.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:4210';
const results = [];
const record = (id, label, expected, actual, pass) => {
  results.push({ id, pass });
  console.log(`${pass ? '✅' : '❌'} ${id} — ${label}\n     attendu : ${expected}\n     observé : ${actual}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

async function screenState(page) {
  return page.evaluate(() => {
    const txt = document.body.innerText || '';
    return {
      adminUi: /se déconnecter/i.test(txt) || !!document.querySelector('.gnz-user-chip'),
      // Le formulaire de récupération demande une confirmation du mot de passe
      recoveryForm: /confirm/i.test(txt) && /mot de passe/i.test(txt),
      loginForm: /mot de passe/i.test(txt),
      heading: document.querySelector('h1,h2')?.textContent?.trim()?.slice(0, 70) || null,
      bodyStart: txt.replace(/\s+/g, ' ').trim().slice(0, 120),
    };
  });
}

// ---------- J : lien de récupération → formulaire de récupération ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await isolate(page);
  await page.goto(`${BASE}/admin#access_token=fake&refresh_token=fake&type=recovery`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const s = await screenState(page);
  record('J', 'Lien de récupération de mot de passe',
    'formulaire de récupération affiché, PAS l\'interface admin',
    `adminUi=${s.adminUi}, recoveryForm=${s.recoveryForm}, titre="${s.heading}"`,
    s.adminUi === false && s.recoveryForm === true);
  await ctx.close();
}

// ---------- J-bis : récupération alors qu'un profil admin est en cache ----------
// (cas réel : un admin déjà venu sur la machine clique sur son lien de reset)
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await isolate(page);
  await page.addInitScript(() => {
    localStorage.setItem('gnz-admin-profile', JSON.stringify({
      id: 'x', userId: 'x', email: 'admin@example.com',
      permission: 'owner', role: 'owner', displayName: 'Admin',
    }));
  });
  await page.goto(`${BASE}/admin#access_token=fake&refresh_token=fake&type=recovery`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const s = await screenState(page);
  record('J2', 'Récupération avec profil admin déjà en cache',
    'formulaire de récupération affiché malgré le cache',
    `adminUi=${s.adminUi}, recoveryForm=${s.recoveryForm}`,
    s.adminUi === false && s.recoveryForm === true);
  await ctx.close();
}

// ---------- L : écran de login normal toujours fonctionnel ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await isolate(page);
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const s = await screenState(page);
  const hasEmail = await page.locator('input[type="email"]').count();
  const hasPwd = await page.locator('input[type="password"]').count();
  record('L', 'Écran de connexion standard',
    'formulaire email + mot de passe présent',
    `champs email=${hasEmail}, mot de passe=${hasPwd}, titre="${s.heading}"`,
    hasEmail > 0 && hasPwd > 0 && s.adminUi === false);
  await ctx.close();
}

// ---------- Site public non impacté ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await isolate(page);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const bodyLen = await page.evaluate(() => (document.body.innerText || '').length);
  record('PUB', 'Site public (non-régression)',
    'page rendue, aucune erreur JS',
    `longueur contenu=${bodyLen}, erreurs JS=${errors.length ? errors.join(' | ').slice(0, 120) : 'aucune'}`,
    bodyLen > 200 && errors.length === 0);
  await ctx.close();
}

await browser.close();

console.log('\n──────── SYNTHÈSE ────────');
const failed = results.filter(r => !r.pass);
console.log(`${results.length - failed.length}/${results.length} conformes`);
if (failed.length) console.log('ÉCHECS : ' + failed.map(f => f.id).join(', '));
process.exit(failed.length ? 1 : 0);
