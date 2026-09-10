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
// 1. Hiérarchie des rôles frontend.
// ---------------------------------------------------------------------------
const ORDER = ["viewer", "editor", "admin", "owner"];
for (let i = 0; i < ORDER.length; i += 1) {
  for (let j = 0; j < ORDER.length; j += 1) {
    const expected = j >= i;
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
// 2. Défense en profondeur dans l'interface.
// ---------------------------------------------------------------------------
const navBlock = layout.slice(layout.indexOf("const NAV_GROUPS"), layout.indexOf("const allItems"));
const entries = [...navBlock.matchAll(/\{\s*id:\s*"([a-z]+)"[^}]*\}/g)];
assert.ok(entries.length >= 10, "la navigation admin doit être détectée");
for (const [raw, id] of entries) {
  assert.match(raw, /min:\s*"(viewer|editor|admin|owner)"/,
    `l'entrée de navigation "${id}" doit déclarer un rôle minimal`);
}
const minOf = (id) => navBlock.match(new RegExp(`id: "${id}"[^}]*min: "(\\w+)"`))?.[1];
assert.equal(minOf("users"), "owner");
assert.equal(minOf("settings"), "admin");
assert.match(layout, /import \{ hasPermission, logout \}/);
assert.match(layout, /visibleGroups\.map\(\(group\)/);
assert.doesNotMatch(layout, /<nav className="gnz-nav"[^>]*>\{NAV_GROUPS\.map/);
assert.match(layout, /sectionRefused/);
assert.match(layout, /let rendered = sectionRefused \? null : children;/);

// ---------------------------------------------------------------------------
// 3. Migrations additives et rollbacks présents.
// ---------------------------------------------------------------------------
const migrations = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
assert.ok(migrations.length > 0);
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
  const rollback = file.replace(/\.sql$/, ".down.sql");
  assert.doesNotThrow(() => readFileSync(`supabase/rollback/${rollback}`, "utf8"),
    `${file} doit avoir un rollback : supabase/rollback/${rollback}`);
}

// ---------------------------------------------------------------------------
// 4. Contrat RBAC complet, basé sur le vrai inventaire Supabase production.
// ---------------------------------------------------------------------------
const policies = readFileSync("supabase/migrations/20260910120100_rbac_restrictive_policies.sql", "utf8");
const created = [...policies.matchAll(/create policy[\s\S]{0,220}?as (restrictive|permissive)/gi)];
assert.ok(created.length > 0);
for (const [, kind] of created) {
  assert.equal(kind.toLowerCase(), "restrictive", "toutes les policies RBAC ajoutées doivent être RESTRICTIVES");
}

const parsedSpecs = new Map(
  [...policies.matchAll(/\('([a-z_]+)',\s*(null::text|'([a-z]+)'),\s*'([a-z]+)'\)/g)]
    .map((m) => [m[1], { write: m[3] || null, read: m[4] }]),
);
const EXPECTED = {
  activity_log: { write: null, read: "viewer" },
  analytics_events: { write: null, read: "viewer" },
  audit_log: { write: null, read: "admin" },
  bookings: { write: "admin", read: "viewer" },
  content_albums: { write: "editor", read: "viewer" },
  crm_notes: { write: "admin", read: "viewer" },
  customers: { write: "admin", read: "viewer" },
  email_events: { write: null, read: "viewer" },
  email_messages: { write: "admin", read: "viewer" },
  external_metric_snapshots: { write: "admin", read: "viewer" },
  integration_settings: { write: "admin", read: "viewer" },
  leads: { write: "admin", read: "viewer" },
  media_assets: { write: "editor", read: "viewer" },
  news_posts: { write: "editor", read: "viewer" },
  packages: { write: "editor", read: "viewer" },
  partner_contacts: { write: "admin", read: "viewer" },
  partners: { write: "editor", read: "viewer" },
  promotions: { write: "editor", read: "viewer" },
  sessions: { write: null, read: "viewer" },
  site_content: { write: "editor", read: "viewer" },
  site_settings: { write: "admin", read: "viewer" },
  style_month: { write: "editor", read: "viewer" },
  vip_clients: { write: "editor", read: "viewer" },
  visitors: { write: null, read: "viewer" },
  wedding_inspirations: { write: "editor", read: "viewer" },
};
assert.equal(parsedSpecs.size, Object.keys(EXPECTED).length,
  `la matrice SQL doit couvrir exactement ${Object.keys(EXPECTED).length} tables de production`);
for (const [table, expected] of Object.entries(EXPECTED)) {
  assert.deepEqual(parsedSpecs.get(table), expected, `droits RBAC incorrects ou absents pour ${table}`);
}

// Un utilisateur authenticated non-admin ne doit pas perdre la lecture des
// contenus publics à cause d'une policy restrictive réservée aux admins.
assert.match(policies, /private\.current_admin_role\(\) is null or private\.has_admin_role/,
  "les policies SELECT doivent préserver les lectures publiques authenticated non-admin");

// admin_access : self-read pour établir le profil, owner pour écrire.
assert.match(policies, /lower\(email\) = lower\(coalesce\(auth\.jwt\(\)->>'email', ''\)\)/);
assert.match(policies, /rbac_write_admin_access[\s\S]{0,180}has_admin_role\('owner'\)/);

// Storage doit suivre la même hiérarchie : site-media = editor+ en écriture.
for (const op of ["write", "update", "delete"]) {
  assert.match(policies, new RegExp(`rbac_${op}_site_media[\\s\\S]{0,260}has_admin_role\\('editor'\\)`),
    `storage.objects doit protéger ${op} sur site-media`);
}

// ---------------------------------------------------------------------------
// 5. Fonctions de rôle compatibles avec l'enum admin_role réel.
// ---------------------------------------------------------------------------
const fns = readFileSync("supabase/migrations/20260910120000_rbac_role_functions.sql", "utf8");
assert.match(fns, /grant usage on schema private to authenticated/i);
assert.match(fns, /grant execute on function private\.has_admin_role\(text\)\s+to authenticated/i);
assert.match(fns, /security\s+definer/i);
assert.match(fns, /select a\.role::text/,
  "admin_access.role est un enum en production : le cast explicite vers text est obligatoire");
assert.match(fns, /min_rank > 0 and current_rank >= min_rank/,
  "un rôle demandé inconnu (rang 0) doit être refusé, pas accepté implicitement");

const integrity = readFileSync("supabase/migrations/20260910120200_admin_access_integrity.sql", "utf8");
assert.match(integrity, /admin_role_rank\(role::text\)/,
  "la contrainte admin_access doit caster l'enum admin_role en text");

// ---------------------------------------------------------------------------
// 6. Vues CRM : relations réelles, pas de colonnes inventées, RLS héritée.
// ---------------------------------------------------------------------------
const crm = readFileSync("supabase/migrations/20260910120400_crm_unified_views.sql", "utf8");
const views = [...crm.matchAll(/create or replace view public\.(\w+)([\s\S]{0,160}?)as\b/g)];
assert.ok(views.length >= 2);
for (const [, name, opts] of views) {
  assert.match(opts, /with \(security_invoker = true\)/,
    `la vue ${name} doit utiliser security_invoker = true`);
}
assert.doesNotMatch(crm, /\bb\.email\b/,
  "bookings.email n'existe pas dans le schéma production");
for (const relation of [
  /b\.customer_id/,
  /b\.lead_id/,
  /n\.customer_id/,
  /n\.lead_id/,
  /e\.booking_id/,
  /e\.lead_id/,
]) {
  assert.match(crm, relation, `la vue CRM doit utiliser la relation réelle ${relation}`);
}
assert.match(crm, /e\.status::text/,
  "email_status est un enum en production et doit être casté pour UNION avec text");
assert.doesNotMatch(crm, /grant\s+(insert|update|delete|all)[^;]*on public\.crm_/i);
assert.match(crm, /grant select on public\.crm_contacts to authenticated/);

const crmCode = crm.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
for (const [pattern, label] of [
  [/\binsert\s+into\b/i, "INSERT"],
  [/\bupdate\s+public\./i, "UPDATE"],
  [/\bdelete\s+from\b/i, "DELETE"],
  [/\balter\s+table\b/i, "ALTER TABLE"],
]) {
  assert.doesNotMatch(crmCode, pattern, `la migration CRM ne doit déplacer aucune donnée (${label})`);
}

console.log("RBAC validation passed");
