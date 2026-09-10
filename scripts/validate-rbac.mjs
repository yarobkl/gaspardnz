import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
  get length() { return this.values.size; }
}
globalThis.localStorage = new MemoryStorage();
globalThis.window = { localStorage: globalThis.localStorage, location: { hash: "", pathname: "/admin", search: "" } };

const { hasPermission } = await import("../src/services/adminAuth.js");
const layout = readFileSync("src/components/Admin/AdminLayout.jsx", "utf8");

// ---------------------------------------------------------------------------
// 1. Hiérarchie des rôles.
// ---------------------------------------------------------------------------
const ORDER = ["viewer", "editor", "admin", "owner"];
for (let i = 0; i < ORDER.length; i += 1) {
  for (let j = 0; j < ORDER.length; j += 1) {
    const expected = j >= i; // le rôle j satisfait-il l'exigence i ?
    assert.equal(
      hasPermission(ORDER[i], ORDER[j]), expected,
      `hasPermission("${ORDER[i]}", "${ORDER[j]}") doit valoir ${expected}`,
    );
  }
}
for (const bogus of [undefined, null, "", "superadmin", "OWNER "]) {
  assert.equal(hasPermission("viewer", bogus), false,
    `un rôle non reconnu (${JSON.stringify(bogus)}) ne doit donner aucun droit`);
}

// ---------------------------------------------------------------------------
// 2. Chaque entrée de navigation déclare un rôle minimal, et le filtrage est
//    réellement appliqué. Une entrée sans `min` serait visible par tous.
// ---------------------------------------------------------------------------
const navBlock = layout.slice(layout.indexOf("const NAV_GROUPS"), layout.indexOf("const allItems"));
const entries = [...navBlock.matchAll(/\{\s*id:\s*"([a-z]+)"[^}]*\}/g)];
assert.ok(entries.length >= 10, "la navigation admin doit être détectée");
for (const [raw, id] of entries) {
  assert.match(raw, /min:\s*"(viewer|editor|admin|owner)"/,
    `l'entrée de navigation "${id}" doit déclarer un rôle minimal`);
}

const minOf = (id) => navBlock.match(new RegExp(`id: "${id}"[^}]*min: "(\\w+)"`))?.[1];
assert.equal(minOf("users"), "owner", "la gestion des utilisateurs doit être réservée au propriétaire");
assert.equal(minOf("settings"), "admin", "les paramètres doivent être réservés aux administrateurs");

assert.match(layout, /import \{ hasPermission, logout \}/, "AdminLayout doit importer hasPermission");
assert.match(layout, /visibleGroups\.map\(\(group\)/, "la navigation rendue doit être la version filtrée");
assert.doesNotMatch(layout, /<nav className="gnz-nav"[^>]*>\{NAV_GROUPS\.map/,
  "la navigation ne doit pas être rendue sans filtrage");
assert.match(layout, /sectionRefused/, "une section atteinte par URL directe doit pouvoir être refusée");
assert.match(layout, /let rendered = sectionRefused \? null : children;/,
  "aucun module ne doit être rendu quand la section est refusée");

// ---------------------------------------------------------------------------
// 3. Les migrations doivent rester additives et non destructives.
//    Interdits sans validation explicite : DROP TABLE, TRUNCATE, DELETE massif.
// ---------------------------------------------------------------------------
const migrations = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
assert.ok(migrations.length > 0, "au moins une migration doit exister");

const FORBIDDEN = [
  [/\bdrop\s+table\b/i, "DROP TABLE"],
  [/\btruncate\b/i, "TRUNCATE"],
  [/\bdrop\s+schema\b/i, "DROP SCHEMA"],
  [/\bdrop\s+database\b/i, "DROP DATABASE"],
  [/\bdelete\s+from\b/i, "DELETE FROM"],
  [/\bdrop\s+column\b/i, "DROP COLUMN"],
];
for (const file of migrations) {
  const sql = readFileSync(`supabase/migrations/${file}`, "utf8");
  const code = sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const [pattern, label] of FORBIDDEN) {
    assert.doesNotMatch(code, pattern, `${file} contient une opération destructive : ${label}`);
  }
  // Chaque migration doit avoir son rollback.
  const rollback = file.replace(/\.sql$/, ".down.sql");
  assert.doesNotThrow(() => readFileSync(`supabase/rollback/${rollback}`, "utf8"),
    `${file} doit avoir un rollback : supabase/rollback/${rollback}`);
}

// ---------------------------------------------------------------------------
// 4. Les politiques de rôle doivent être RESTRICTIVES : une politique
//    permissive supplémentaire n'interdirait rien (les permissives se
//    combinent en OU).
// ---------------------------------------------------------------------------
const policies = readFileSync("supabase/migrations/20260910120100_rbac_restrictive_policies.sql", "utf8");
const created = [...policies.matchAll(/create policy[\s\S]{0,200}?as (restrictive|permissive)/gi)];
assert.ok(created.length > 0, "des politiques doivent être créées");
for (const [, kind] of created) {
  assert.equal(kind.toLowerCase(), "restrictive",
    "les politiques de rôle doivent être RESTRICTIVES pour pouvoir restreindre");
}
assert.match(policies, /email = lower\(auth\.email\(\)\)/,
  "chaque compte doit pouvoir lire sa propre ligne admin_access, sinon la connexion casse");

// ---------------------------------------------------------------------------
// 5. Les fonctions de rôle doivent être appelables par `authenticated`.
// ---------------------------------------------------------------------------
const fns = readFileSync("supabase/migrations/20260910120000_rbac_role_functions.sql", "utf8");
assert.match(fns, /grant usage on schema private to authenticated/i,
  "sans USAGE sur le schéma private, toutes les vérifications de rôle échouent");
assert.match(fns, /grant execute on function private\.has_admin_role\(text\)\s+to authenticated/i);
assert.match(fns, /security\s+definer/i,
  "current_admin_role doit être SECURITY DEFINER pour éviter une récursion RLS");

// ---------------------------------------------------------------------------
// 6. Les vues CRM ne doivent pas devenir une porte dérobée.
//    Sans security_invoker, une vue s'exécute avec les droits de son
//    propriétaire et contourne les politiques RLS des tables sous-jacentes.
// ---------------------------------------------------------------------------
const crm = readFileSync("supabase/migrations/20260910120400_crm_unified_views.sql", "utf8");
const views = [...crm.matchAll(/create or replace view public\.(\w+)([\s\S]{0,120}?)as\b/g)];
assert.ok(views.length >= 2, "les vues CRM doivent être détectées");
for (const [, name, opts] of views) {
  assert.match(opts, /with \(security_invoker = true\)/,
    `la vue ${name} doit déclarer security_invoker = true, sinon elle contourne RLS`);
}
// Lecture seule : aucun droit d'écriture accordé sur les vues.
assert.doesNotMatch(crm, /grant\s+(insert|update|delete|all)[^;]*on public\.crm_/i,
  "les vues CRM doivent rester en lecture seule");
assert.match(crm, /grant select on public\.crm_contacts to authenticated/);
// Unification par vues, pas par déplacement de données.
const crmCode = crm.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
for (const [pattern, label] of [
  [/\binsert\s+into\b/i, "INSERT"],
  [/\bupdate\s+public\./i, "UPDATE"],
  [/\bdelete\s+from\b/i, "DELETE"],
  [/\balter\s+table\b/i, "ALTER TABLE"],
]) {
  assert.doesNotMatch(crmCode, pattern,
    `la migration CRM ne doit déplacer aucune donnée (${label} trouvé)`);
}

console.log("RBAC validation passed");
