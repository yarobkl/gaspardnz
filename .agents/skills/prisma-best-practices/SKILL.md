---
name: prisma-best-practices
description: Review Prisma models, migrations, generated client and transactional data access while respecting the repository's installed Prisma version.
---

# prisma-best-practices

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/prisma/skills

## Use it for
Prisma schema design, queries, transaction safety, relationships, data isolation and migration preparation.

## Method
1. Read package.json, schema.prisma and migration history to identify the installed Prisma version and provider.
2. Verify model relations, tenant keys, nullability, uniqueness, referential actions and indexes.
3. Examine query counts and transaction scopes, and avoid unsafe read-modify-write sequences.
4. For schema changes, propose an explicit migration and backwards-compatibility plan; avoid automatic production `db push`.
5. Match all examples and commands to the pinned version (Prisma 5 and Prisma 7 differ significantly).
6. Test migrations and representative queries in disposable environments before a production change.

## Report
Affected models/migrations, access implications, commands and evidence; point out unrun checks.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
