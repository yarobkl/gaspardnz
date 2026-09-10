#!/usr/bin/env bash
# Rejoue les migrations RBAC sur une base PostgreSQL locale jetable et vérifie
# le comportement réel des politiques RLS, rôle par rôle.
#
# Ceci ne touche JAMAIS Supabase : tout se passe sur une base locale créée puis
# détruite. Voir scripts/rls-harness/README.md.
set -euo pipefail

DB="${DB:-gnz_rls_test}"
PSQL="psql -v ON_ERROR_STOP=1 -q"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"

dropdb --if-exists "$DB"
createdb "$DB"

PGOPTIONS="-c client_min_messages=warning" $PSQL -d "$DB" -f "$HERE/00-supabase-env.sql"
PGOPTIONS="-c client_min_messages=warning" $PSQL -d "$DB" -f "$HERE/01-app-schema.sql"
PGOPTIONS="-c client_min_messages=warning" $PSQL -d "$DB" -f "$HERE/02-baseline-policies.sql"

echo "--- démonstration de la faille sur la baseline ---"
$PSQL -d "$DB" -f "$HERE/02b-baseline-gap.sql"

echo "--- migrations RBAC ---"
for m in "$ROOT"/supabase/migrations/*.sql; do
  echo "  $(basename "$m")"
  PGOPTIONS="-c client_min_messages=warning" $PSQL -d "$DB" -f "$m"
done

echo "--- idempotence : seconde application ---"
for m in "$ROOT"/supabase/migrations/*.sql; do
  PGOPTIONS="-c client_min_messages=warning" $PSQL -d "$DB" -f "$m"
done
echo "  OK (rejouables sans erreur)"

echo "--- matrice de droits ---"
$PSQL -d "$DB" -f "$HERE/03-assertions.sql"

echo "--- rollback ---"
for r in $(ls -r "$ROOT"/supabase/rollback/*.down.sql); do
  echo "  $(basename "$r")"
  PGOPTIONS="-c client_min_messages=warning" $PSQL -d "$DB" -f "$r"
done
$PSQL -d "$DB" -c "select count(*) as politiques_rbac_restantes from pg_policies where policyname like 'rbac\_%';"

dropdb "$DB"
echo "Base de test supprimée."
