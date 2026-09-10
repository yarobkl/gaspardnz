import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://127.0.0.1:4210';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
let ok = true;
for (const path of ['/', '/admin']) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('gnz-admin-profile',
    JSON.stringify({ role: 'owner', displayName: 'ANCIEN CACHE' })));
  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const left = await page.evaluate(() => localStorage.getItem('gnz-admin-profile'));
  const pass = left === null;
  ok &&= pass;
  console.log(`${pass ? '✅' : '❌'} PURGE ${path} — ancien cache après chargement : ${left === null ? 'supprimé' : left}`);
  await ctx.close();
}
await browser.close();
process.exit(ok ? 0 : 1);
