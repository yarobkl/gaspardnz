// Préflight statique du build 25, complément des tests iPhone et d'App Store Connect.
import fs from "node:fs";
import assert from "node:assert/strict";
const load = (file) => fs.readFileSync(file,"utf8");
const files = ["ios/App/App/Info.plist","ios/App/App/App.entitlements",
"public/confidentialite.html","public/mentions-legales.html","public/cgv.html",
"src/components/NativeExperience.jsx","src/components/WhatsappContactModal.jsx",
"src/components/GalleryMobile.jsx","src/components/NativeEditorial.jsx",
"docs/APP_STORE_RELEASE_READINESS.md"];
for(const f of files) assert(fs.existsSync(f),"Fichier obligatoire absent : "+f);
const plist=load(files[0]);
assert(plist.includes("<string>GaspardNZ</string>"),"Nom iOS incorrect");
assert(plist.includes("<key>ITSAppUsesNonExemptEncryption</key>"),"Chiffrement iOS non déclaré");
assert(load(files[1]).includes("<key>aps-environment</key>"),"Entitlements Push absentes");
assert(fs.existsSync("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"),"Icône absente");
const native=load("src/components/NativeExperience.jsx");
for(const url of ["https://gaspardnz.style/confidentialite.html",
"https://gaspardnz.style/mentions-legales.html","https://gaspardnz.style/cgv.html"]){
  assert(native.includes(url),"Lien légal iOS manquant : "+url);
}
assert(native.includes("showInternalPushTools"),"Protection diagnostics absente");
assert(native.includes('VITE_GNZ_INTERNAL_BUILD === "true"'),"Outils internes non conditionnés");
assert(!native.includes("settings.stripePaymentUrl"),"Achat de lookbook numérique potentiellement visible");
assert(native.includes("onContact={openContact}"),"Contact CRM contextualisé manquant");
for(const f of ["public/confidentialite.html","public/mentions-legales.html","public/cgv.html"]){
  const html=load(f);
  assert(/gaspardnz\.contact@gmail\.com/.test(html),"Contact légal manquant : "+f);
  assert(/NZAOU KIMPOLO GASPARD/.test(html),"Responsable déclaré manquant : "+f);
}
const contact=load("src/components/WhatsappContactModal.jsx");
assert(contact.includes("copy.notice"),"Notice RGPD absente");
assert(contact.includes("confidentialite.html"),"Lien confidentialité du formulaire absent");
console.log("Préflight statique App Store : OK");
console.log("A vérifier manuellement : captures, App Privacy, classe d'âge, droits photo, règle 4.2 et recette iPhone.");
