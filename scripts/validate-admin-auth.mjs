import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

const localStorage = new MemoryStorage();
globalThis.localStorage = localStorage;
globalThis.window = { localStorage, location: { hash: "", pathname: "/admin", search: "" } };

const adminAuth = readFileSync("src/services/adminAuth.js", "utf8");
const app = readFileSync("src/App.jsx", "utf8");
const settings = readFileSync("src/components/Admin/AdminSettings.jsx", "utf8");
const supabaseClient = readFileSync("src/services/supabaseClient.js", "utf8");
const login = readFileSync("src/components/Admin/AdminLogin.jsx", "utf8");

// ---------------------------------------------------------------------------
// 1. Aucun profil admin ne doit être persisté côté navigateur.
//    Un profil stocké est modifiable par l'utilisateur : il ne prouve rien.
// ---------------------------------------------------------------------------
assert.doesNotMatch(
  adminAuth,
  /localStorage\.setItem\(\s*(LEGACY_)?PROFILE_KEY/,
  "adminAuth.js ne doit jamais écrire de profil admin dans localStorage",
);
assert.doesNotMatch(
  adminAuth,
  /localStorage\.getItem\(\s*(LEGACY_)?PROFILE_KEY/,
  "adminAuth.js ne doit jamais relire un profil admin depuis localStorage",
);
assert.match(
  adminAuth,
  /initAdminUsers = \(\) => \{[\s\S]*localStorage\.removeItem\(LEGACY_PROFILE_KEY\)/,
  "l'ancien cache de profil doit être purgé au démarrage",
);
assert.doesNotMatch(
  adminAuth,
  /export function getCachedProfile|export function getSession/,
  "aucune lecture de cache ne doit être exportée comme si elle faisait autorité",
);

// ---------------------------------------------------------------------------
// 2. La session Supabase (+ admin_access.active) est la seule autorité.
// ---------------------------------------------------------------------------
assert.match(adminAuth, /supabase\.auth\.getSession\(\)/, "refreshSession doit interroger Supabase");
assert.match(
  adminAuth,
  /if \(!data\?\.session\?\.user\) return null;/,
  "sans session Supabase, refreshSession doit retourner null",
);
assert.match(
  adminAuth,
  /\.eq\("active", true\)/,
  "l'appartenance à admin_access doit exiger active = true",
);
assert.match(
  adminAuth,
  /await supabase\.auth\.signOut\(\);[\s\S]{0,80}n'est pas autorisé/,
  "un compte Supabase valide hors admin_access doit être déconnecté",
);

// ---------------------------------------------------------------------------
// 3. App.jsx : l'état admin ne peut venir que d'une vérification réseau.
// ---------------------------------------------------------------------------
assert.match(app, /refreshSession\(\)\.then\(applyProfile\)/, "App.jsx doit vérifier la session au montage");
assert.match(app, /onAuthStateChange\(applyProfile\)/, "App.jsx doit réagir à l'expiration et à la déconnexion");
assert.match(app, /setIsAdminLoggedIn\(Boolean\(profile\)\)/, "l'état connecté doit dériver du profil vérifié");
assert.doesNotMatch(
  app,
  /getCachedProfile|getSession\(\)/,
  "App.jsx ne doit jamais dériver l'état admin d'un cache navigateur",
);

// Aucun rendu de l'interface admin tant que la vérification n'a pas répondu.
assert.match(app, /const \[adminAuthChecking, setAdminAuthChecking\] = useState\(true\)/,
  "la vérification doit démarrer à true pour éviter tout flash de l'interface admin");
assert.match(app, /\{adminAuthChecking \? null : isAdminLoggedIn \?/,
  "l'interface admin ne doit pas être rendue pendant la vérification");

// ---------------------------------------------------------------------------
// 4. Non-régression : le lien de réinitialisation ouvre une vraie session
//    Supabase (detectSessionInUrl). Sans garde, l'interface admin remplacerait
//    le formulaire de nouveau mot de passe.
// ---------------------------------------------------------------------------
assert.match(supabaseClient, /detectSessionInUrl:\s*true/, "prérequis du flux de récupération");
assert.match(app, /isPasswordRecoveryLink\(\)/, "App.jsx doit détecter le flux de récupération");
assert.match(
  app,
  /if \(recoveryFlowRef\.current === null\) recoveryFlowRef\.current = isPasswordRecoveryLink\(\);/,
  "le flux de récupération doit être figé une seule fois par chargement de page",
);
assert.match(login, /isPasswordRecoveryLink\(\)/, "AdminLogin doit basculer en mode récupération");

// ---------------------------------------------------------------------------
// 5. Les écrans admin lisent le profil vérifié, pas un cache.
// ---------------------------------------------------------------------------
assert.match(settings, /refreshSession/, "AdminSettings doit lire le profil vérifié");
for (const [file, source] of [
  ["src/App.jsx", app],
  ["src/components/Admin/AdminSettings.jsx", settings],
  ["src/components/Admin/AdminLayout.jsx", readFileSync("src/components/Admin/AdminLayout.jsx", "utf8")],
  ["src/components/Admin/AdminLogin.jsx", login],
]) {
  assert.equal(source.includes("gnz-admin-profile"), false, `${file} ne doit pas manipuler le cache de profil`);
}

// ---------------------------------------------------------------------------
// 6. Aucune clé de service côté navigateur.
// ---------------------------------------------------------------------------
assert.doesNotMatch(supabaseClient, /service_role|SERVICE_ROLE/, "aucune service role key côté frontend");
assert.doesNotMatch(supabaseClient, /sb_secret_|eyJ[A-Za-z0-9_-]{20,}/, "aucune clé secrète en dur");

// ---------------------------------------------------------------------------
// 7. Comportement réel du module : un cache falsifié n'ouvre aucun accès.
// ---------------------------------------------------------------------------
localStorage.setItem("gnz-admin-profile", JSON.stringify({ role: "owner", email: "attaquant@example.com" }));

const supabaseStub = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signOut: async () => ({}),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
  from: () => { throw new Error("admin_access ne doit pas être interrogée sans session"); },
};

const { login: doLogin, refreshSession, isAuthenticated, hasPermission, initAdminUsers } =
  await import("../src/services/adminAuth.js");

// initAdminUsers purge l'ancien cache au lieu de le consommer.
initAdminUsers();
assert.equal(localStorage.getItem("gnz-admin-profile"), null, "l'ancien cache doit être purgé");

// Sans session Supabase, aucun accès — quel que soit le contenu du navigateur.
const clientModule = await import("../src/services/supabaseClient.js");
const realAuth = clientModule.supabase.auth;
clientModule.supabase.auth = supabaseStub.auth;
try {
  assert.equal(await refreshSession(), null, "aucune session Supabase => aucun profil");
  assert.equal(await isAuthenticated(), false, "aucune session Supabase => non authentifié");
  const empty = await doLogin("", "");
  assert.equal(empty.success, false, "identifiants vides refusés");
} finally {
  clientModule.supabase.auth = realAuth;
}

// Hiérarchie des rôles (base de la phase RBAC).
assert.equal(hasPermission("owner", "viewer"), false);
assert.equal(hasPermission("admin", "editor"), false);
assert.equal(hasPermission("editor", "admin"), true);
assert.equal(hasPermission("owner", "owner"), true);
assert.equal(hasPermission("viewer", undefined), false, "rôle absent => aucun droit");
assert.equal(hasPermission("viewer", "role-inconnu"), false, "rôle inconnu => aucun droit");

console.log("Admin auth validation passed");
