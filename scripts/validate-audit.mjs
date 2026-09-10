import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const MIGRATION = "supabase/migrations/20260910120300_audit_log_server_side.sql";
const audit = readFileSync(MIGRATION, "utf8");
const rollback = readFileSync("supabase/rollback/20260910120300_audit_log_server_side.down.sql", "utf8");
const adminData = readFileSync("src/services/adminData.js", "utf8");

// ---------------------------------------------------------------------------
// 1. Le navigateur ne doit plus écrire dans le journal.
//    Une trace dont le contenu vient du client ne prouve rien.
// ---------------------------------------------------------------------------
assert.doesNotMatch(
  adminData,
  /from\("activity_log"\)\s*\.\s*(insert|upsert|update|delete)/,
  "adminData.js ne doit plus écrire dans activity_log : le serveur s'en charge",
);
assert.match(
  adminData,
  /from\("activity_log"\)\s*\.select/,
  "le tableau de bord doit toujours pouvoir LIRE le journal",
);

// ---------------------------------------------------------------------------
// 2. L'acteur est lu dans le JWT, jamais dans la requête.
// ---------------------------------------------------------------------------
assert.match(audit, /actor\s+text\s*:=\s*lower\(nullif\(auth\.email\(\)/,
  "l'acteur doit provenir de auth.email()");
assert.doesNotMatch(audit, /actor_email\s*(:=|=)\s*(new|old)\./i,
  "l'acteur ne doit jamais être repris depuis la ligne écrite par le client");
const rowChangeFn = audit.match(/create or replace function private\.audit_row_change\(\)[\s\S]*?\bas \$\$/)?.[0];
assert.ok(rowChangeFn, "la fonction private.audit_row_change doit exister");
assert.match(rowChangeFn, /security\s+definer/i,
  "audit_row_change doit être SECURITY DEFINER, sinon la trace est écrite avec les droits du client et les politiques RLS la bloquent");
assert.match(rowChangeFn, /set search_path\s*=\s*public, pg_temp/i,
  "une fonction SECURITY DEFINER doit fixer son search_path");

// ---------------------------------------------------------------------------
// 3. Aucun secret journalisé.
// ---------------------------------------------------------------------------
const sensitive = audit.match(/audit_is_sensitive[\s\S]*?\$\$;/)?.[0] || "";
for (const term of ["password", "secret", "token", "api_key", "credential", "hash", "salt", "signature"]) {
  assert.ok(sensitive.includes(term),
    `le filtre de colonnes sensibles doit couvrir « ${term} »`);
}
assert.match(audit, /Des NOMS uniquement, jamais de valeurs/,
  "le diff doit rester limité aux noms de colonnes");
assert.match(audit, /select nullif\(string_agg\(key/,
  "audit_changed_columns doit agréger des CLÉS, pas des valeurs");
assert.doesNotMatch(audit, /string_agg\(\s*(key \|\||.*value)/,
  "les valeurs modifiées ne doivent pas être journalisées");

// ---------------------------------------------------------------------------
// 4. Journal en ajout seul.
// ---------------------------------------------------------------------------
assert.match(audit, /create trigger activity_log_append_only/,
  "le journal doit être protégé contre la réécriture");
assert.match(audit, /before update or delete on public\.activity_log/,
  "la protection doit couvrir UPDATE et DELETE");
for (const cmd of ["insert", "update", "delete"]) {
  assert.match(
    audit,
    new RegExp(`create policy audit_no_client_${cmd}[\\s\\S]{0,120}restrictive for ${cmd}`),
    `une politique restrictive doit fermer le ${cmd.toUpperCase()} client sur activity_log`,
  );
}
assert.match(audit, /with check \(false\)/, "l'insertion cliente doit être fermée");

// ---------------------------------------------------------------------------
// 5. Les opérations sensibles doivent être tracées.
// ---------------------------------------------------------------------------
for (const table of ["leads", "bookings", "promotions", "site_settings", "admin_access", "media_assets"]) {
  assert.ok(audit.includes(`'${table}'`), `la table ${table} doit être auditée`);
}
assert.match(audit, /after insert or update or delete/,
  "l'audit doit couvrir création, modification et suppression");

// ---------------------------------------------------------------------------
// 6. Migration non destructive, rollback ne détruisant aucune trace.
// ---------------------------------------------------------------------------
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
assert.match(rollback, /Les lignes déjà\s*\n?--\s*journalisées sont CONSERVÉES|sont CONSERVÉES/,
  "le rollback doit conserver les traces existantes");

console.log("Audit log validation passed");
