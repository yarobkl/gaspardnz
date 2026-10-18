---
name: agent-browser-guide
description: Use a browser automation CLI for reproducible, authorized UI inspection and tests only when the CLI is installed and configured.
---

# agent-browser-guide

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/vercel-labs/agent-browser

## Role
This is a local **integration guide**, not the agent-browser runtime. The upstream project provides a CLI plus version-matched skills.

## Requirements
On an authorized environment, install the upstream discovery skill with `npx skills add vercel-labs/agent-browser`, and install/configure the CLI using its current official documentation. Review install scripts and request approval before executing them.

## Method
1. Confirm `agent-browser --version` and follow instructions returned by `agent-browser skills` for that installed version.
2. Use a staging app or authorized account; prefer snapshots and stable semantic selectors.
3. Navigate, interact, assert and capture evidence only after confirming target and permission.
4. Never execute purchases, destructive admin actions or bulk outbound messages without express approval.
5. Collect reproducible steps and cleanup test state; report missing browser/runtime honestly.

## Alternative
If no agent-browser executable exists, use the available browser/test tooling rather than claiming the CLI was run.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
