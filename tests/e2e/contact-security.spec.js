import {test,expect} from '@playwright/test';
import {acceptCookies} from './helpers.js';
test.use({viewport:{width:390,height:844}});
async function open(page){
 await page.route('**/functions/v1/public-event',r=>r.fulfill({json:{ok:true}}));
 await page.goto('/');await acceptCookies(page);
 await page.getByLabel('Ouvrir le menu').click();await page.getByRole('button',{name:'Rendez-vous',exact:true}).click();
}
async function fill(page){await page.getByLabel(/votre nom/i).fill('Visiteur test');await page.getByLabel(/type de projet/i).selectOption('Autre');await page.getByLabel('Précisez votre projet').fill('Tenue de gala');await page.getByLabel('Téléphone',{exact:true}).fill('0612345678');await page.getByRole('button',{name:/continuer/i}).click();}
test('mobile: optional description, all countries, failure blocks redirect, retry uses same request id',async({page})=>{
 await open(page);expect(await page.locator('#booking-country option').count()).toBeGreaterThan(240);await expect(page.locator('#booking-country')).toHaveValue('FR');
 await page.screenshot({path:'test-results/contact-mobile-step1.png'});
 await fill(page);await expect(page.getByText('Choisissez')).toBeVisible();
 const requests=[];await page.route('**/api/contact-intent',async r=>{requests.push(r.request().postDataJSON());await r.fulfill({status:503,json:{error:'Enregistrement indisponible'}});});
 await page.getByRole('button',{name:/discuter via whatsapp/i}).click();await expect(page.getByRole('alert')).toHaveText('Enregistrement indisponible');expect(page.url()).toContain('127.0.0.1');
 await page.getByRole('button',{name:/discuter via whatsapp/i}).click();await expect.poll(()=>requests.length).toBe(2);expect(requests[0].requestId).toBe(requests[1].requestId);expect(requests[0].phone).toBe('+33612345678');
 await page.screenshot({path:'test-results/contact-mobile-error.png'});
});
test('mobile: waits for persisted success before redirect and ignores double taps',async({page})=>{
 await open(page);await fill(page);let calls=0;let release;
 const gate=new Promise(resolve=>release=resolve);await page.route('**/api/contact-intent',async r=>{calls++;await gate;await r.fulfill({json:{ok:true}});});
 await page.route('https://wa.me/**',r=>r.fulfill({body:'WhatsApp test destination'}));
 const link=page.getByRole('button',{name:/discuter via whatsapp/i});await link.click();await link.click({force:true});await expect(page.getByRole('status')).toBeVisible();expect(calls).toBe(1);expect(page.url()).toContain('127.0.0.1');release();await expect(page).toHaveURL(/wa.me/);
});
