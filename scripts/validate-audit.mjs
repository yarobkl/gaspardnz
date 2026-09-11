import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const MIGRATION = "supabase/migrations/20260910120300_audit_log_server_side.sql";
const audit = readFileSync(MIGRATION, "utf8");
const rollback = readFileSync("supabase/rollback/20260910120300_audit_log_server_side.down.sql", "utf8");
const adminData = readFileSync("src/services/adminData.js", "utf8");

// 1. Le navigateur ne doit plus écrire dans le journal.
assert.doesNotMatch(
  adminData,
  /from\("activity_log"\)\s*\.\s*(insert|upsert|update|delete)/,
  "adminData.js ne doit plus écrire dans activity_log : le serveur s'en charge",
);
assert.match(adminData, /from\("activity_log"\)\s*\.select/,
  "le tableau de bord doit toujours pouvoir lire le journal");

// 2. L'acteur vient du JWT, pas d'une colonne contrôlée par le client.
assert.match(audit, /actor\s+text\s*:=\s*lower\(nullif\(auth\.email\(\)/);
assert.doesNotMatch(audit, /actor_email\s*(:=|=)\s*(new|old)\./i);
const rowChangeFn = audit.match(/create or replace function private\.audit_row_change\(\)[\s\S]*?\bas \$\$/)?.[0];
assert.ok(rowChangeFn, "private.audit_row_change doit exister");
assert.match(rowChangeFn, /security\s+definer/i);
assert.match(rowChangeFn, /set search_path\s*=\s*public, pg_temp/i);

// 3. Aucun secret journalisé.
const sensitive = audit.match(/audit_is_sensitive[\s\S]*?\$\$;/)?.[0] || "";
for (const term of ["password", "secret", "token", "api_key", "credential", "hash", "salt", "signature"]) {
  assert.ok(sensitive.includes(term), `le filtre sensible doit couvrir ${term}`);
}
assert.match(audit, /Noms des colonnes modifiées uniquement|NOMS uniquement/i);
assert.match(audit, /select nullif\(string_agg\(key/);
assert.doesNotMatch(audit, /string_agg\(\s*(key \|\||.*value)/);

// 4. Le schéma production a activity_log.entity_id TEXT. Aucun cast UUID ne
// doit réintroduire la panne constatée pendant la revue.
assert.doesNotMatch(audit, /subject\s*->>\s*'id'[^\n;]*::uuid/i,
  "activity_log.entity_id est text en production : ne pas caster vers uuid");
assert.match(audit, /subject_id\s+text/,
  "l'identifiant d'audit doit rester text");
assert.match(audit, /nullif\(subject ->> 'key', ''\)/,
  "les tables sans id, comme site_settings, doivent avoir une clé d'audit stable");

// 5. Journal en ajout seul + refus explicite des écritures client.
assert.match(audit, /create trigger activity_log_append_only/);
assert.match(audit, /before update or delete on public\.activity_log/);
for (const cmd of ["insert", "update", "delete"]) {
  assert.match(
    audit,
    new RegExp(`create policy audit_no_client_${cmd}[\\s\\S]{0,140}restrictive for ${cmd}`),
    `une politique restrictive doit fermer ${cmd.toUpperCase()} sur activity_log`,
  );
}
assert.match(audit, /with check \(false\)/);

// 6. Couverture des vraies tables administrables de production.
const AUDITED_TABLES = [
  "leads", "bookings", "customers", "crm_notes", "email_messages",
  "promotions", "site_settings", "site_content", "admin_access", "media_assets",
  "content_albums", "packages", "partners", "partner_contacts", "news_posts",
  "vip_clients", "wedding_inspirations", "style_month", "integration_settings",
];
for (const table of AUDITED_TABLES) {
  assert.ok(audit.includes(`'${table}'`), `la table ${table} doit être auditée`);
}
assert.match(audit, /after insert or update or delete/);

// 7. Migration et rollback non destructifs.
const code = (sql) => sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
for (const [label, sql] of [["migration", audit], ["rollback", rollback]]) {
  for (const [pattern, name] of [
    [/\bdrop\s+table\b/i, "DROP TABLE"],
    [/\bdelete\s+from\s+public\.activity_log\b/i, "DELETE des traces"],
    [/\btruncate\b/i, "TRUNCATE"],
  ]) {
    assert.doesNotMatch(code(sql), pattern, `le ${label} ne doit pas contenir ${name}`);
  }
}
assert.match(rollback, /sont CONSERVÉES/i,
  "le rollback doit conserver les traces existantes");

console.log("Audit log validation passed");
