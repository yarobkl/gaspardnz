---
name: domain-modeling
description: Clarify business terms, invariants, tenant scopes and entity life cycles before adding business rules or complex workflows.
---

# domain-modeling

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling

## Use it for
Multi-activity products, inventory, orders, payouts, receipts, reservations, schools and complex status transitions.

## Method
1. Build a short domain glossary grounded in actual code and product language, not fashionable architecture jargon.
2. Identify entities, value objects, ownership, relationships, business events and valid state transitions.
3. Write important invariants (for example stock cannot be decremented twice; external reference is not proof of payment).
4. Work through real scenarios including partial failure, cancellation, duplicates, concurrency, and changing actors.
5. Update types/schema/validation/tests together after user-approved scope is clear; avoid silent behavior changes.
6. Document disagreements, migration impact and unresolved terminology explicitly.

## Avoid
Don't introduce domain-driven-design layers just to follow a pattern; the glossary may be the whole useful result.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
