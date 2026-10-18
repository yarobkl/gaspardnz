---
name: superpowers-workflow
description: Use structured planning, test-driven slices, systematic debugging and evidence-based completion for complex development work.
---

# superpowers-workflow

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/obra/superpowers

## When
Complex bug fixes, multiple dependent features, risky refactors or ambiguous specifications.

## Method
1. Define goals, out-of-scope work, risks, acceptance criteria and current behavior.
2. For a bug, reproduce it first. Write down hypotheses and gather logs/tests rather than guessing.
3. Split the change into small independently verifiable slices; avoid giant uncontrolled rewrites.
4. Prefer a red/green/refactor sequence for deterministic logic where practical.
5. Review the diff, check permissions and regressions, run relevant tests and document what was actually verified.
6. If a step requires external credentials, human approval or a service not provided, stop and identify the blocker.

## Avoid
Don't force meetings, subagents, elaborate plans or needless test scaffolding for a one-line change. No automatic merges or deployments.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
