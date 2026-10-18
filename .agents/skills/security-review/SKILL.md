---
name: security-review
description: Review actual changes and relevant application surfaces for high-confidence security vulnerabilities and permission failures.
---

# security-review

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/getsentry/skills/tree/main/skills/security-review

## Use it for
Auth and RBAC/RLS changes, public forms, database functions, APIs, file uploads, payment flows and dependency updates.

## Method
1. Determine the relevant diff, trust boundaries, actor privileges and attacker-controlled inputs.
2. Trace authorization from client to server/database; inspect object ownership and multi-tenant separation.
3. Check XSS, injection, CSRF, SSRF, secrets, insecure callbacks, CORS and unsafe dependency changes according to actual attack surfaces.
4. Confirm realistic exploit paths before reporting. Separate high-confidence defects from potential risks.
5. Recommend minimal fixes, regression tests and any necessary manual review.

## Guardrails
Do not collect secrets, probe third-party systems without authorization, disable security protections or invent vulnerabilities. Report evidence, severity, affected code and confidence.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
