import { chromium } from 'playwright-core';

const BASE = process.env.BASE || 'http://127.0.0.1:4210';
const results = [];
const record = (id, label, expected, actual, pass) => {
  results.push({ id, label, expected, actual, pass });
  console.log(`${pass ? '✅' : '❌'} ${id} — ${label}\n     attendu : ${expected}\n     observé : ${actual}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// Détecte si l'UI admin authentifiée est rendue (sidebar + bouton déconnexion)
// vs l'écran de login.
async function probeAdminUi(page) {
  return page.evaluate(() => {
    const txt = document.body.innerText || '';
    const hasLogout = /se déconnecter/i.test(txt);
    const hasSidebarUser = !!document.querySelector('.gnz-user-chip');
    const looksLikeLogin = /mot de passe/i.test(txt) && !hasLogout;
    return {
      adminUiRendered: hasLogout || hasSidebarUser,
      loginScreen: looksLikeLogin,
      roleShown: document.querySelector('.gnz-user-chip span')?.textContent?.trim() || null,
      nameShown: document.querySelector('.gnz-user-chip strong')?.textContent?.trim() || null,
    };
  });
}

// ---------- SCÉNARIO A : sans aucune connexion ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const r = await probeAdminUi(page);
  record('A', 'Accès /admin sans connexion',
    'écran de login, aucune UI admin',
    `adminUiRendered=${r.adminUiRendered}, loginScreen=${r.loginScreen}`,
    r.adminUiRendered === false);
  await ctx.close();
}

// ---------- SCÉNARIO D : localStorage falsifié (AUCUNE session Supabase) ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // Injecte un faux profil admin AVANT tout script de l'app
  await page.addInitScript(() => {
    localStorage.setItem('gnz-admin-profile', JSON.stringify({
      id: 'forged-0000',
      userId: 'forged-user',
      email: 'attaquant@example.com',
      permission: 'owner',
      role: 'owner',
      displayName: 'ATTAQUANT',
    }));
  });
  await page.goto(`${BASE}/admin`, { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  const r = await probeAdminUi(page);
  // Vérifie aussi qu'il n'existe bien AUCUNE session Supabase
  const supaSession = await page.evaluate(() => localStorage.getItem('gnz-admin-auth'));
  record('D', 'localStorage falsifié sans session Supabase',
    'UI admin refusée (adminUiRendered=false)',
    `adminUiRendered=${r.adminUiRendered}, rôle affiché="${r.roleShown}", nom="${r.nameShown}", sessionSupabase=${supaSession ? 'présente' : 'ABSENTE'}`,
    r.adminUiRendered === false);
  await ctx.close();
}

// ---------- SCÉNARIO C : profil en cache + session Supabase expirée/absente, après rechargement ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('gnz-admin-profile', JSON.stringify({
      id: 'stale', userId: 'stale', email: 'ancien-admin@example.com',
      permission: 'admin', role: 'admin', displayName: 'Ancien Admin',
    }));
    // Session Supabase expirée depuis longtemps
    localStorage.setItem('gnz-admin-auth', JSON.stringify({
      access_token: 'expired', refresh_token: 'expired',
      expires_at: Math.floor(Date.now() / 1000) - 86400,
    }));
  });
  await page.goto(`${BASE}/admin`, { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  const r = await probeAdminUi(page);
  record('C', 'Session Supabase expirée + cache profil présent',
    'UI admin refusée après expiration',
    `adminUiRendered=${r.adminUiRendered}, rôle affiché="${r.roleShown}"`,
    r.adminUiRendered === false);
  await ctx.close();
}

await browser.close();

console.log('\n──────── SYNTHÈSE ────────');
const failed = results.filter(r => !r.pass);
console.log(`${results.length - failed.length}/${results.length} scénarios conformes`);
if (failed.length) {
  console.log('VULNÉRABILITÉS CONFIRMÉES : ' + failed.map(f => f.id).join(', '));
}
