---
name: supabase-practices
description: Audit and design Supabase Auth, RLS, Postgres policies, migrations and data consistency before changing Supabase-backed workflows.
---

# supabase-practices

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/supabase/agent-skills

## Use it for
Supabase Auth, Row Level Security, Postgres schemas and queries, Edge Functions, and migrations.

## Method
1. Map the actors, tenant boundaries and affected tables, policies, functions and API paths.
2. Identify exactly which user can read/write which data. Never trust only a client-side tenant filter.
3. Review PostgreSQL schema, indexes, foreign keys, constraints and transactions; inspect slow queries with evidence before optimizing.
4. For financial or stock operations, preserve atomicity, precision, idempotency and concurrency behavior.
5. Prepare migration and rollback plans, and test authorized as well as unauthorized paths with separate identities.
6. Never run production migrations, remove RLS, or edit secrets without explicit authorization.

## Report
Tables/functions/policies inspected; exact migration proposal; tests run and not run; remaining risks.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
