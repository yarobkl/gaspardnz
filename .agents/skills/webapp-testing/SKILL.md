---
name: webapp-testing
description: Build and run safe browser-driven tests of business workflows, including screenshots and negative cases where tooling exists.
---

# webapp-testing

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/anthropics/skills/tree/main/skills/webapp-testing

## Use it for
Testing forms, logins, stock operations, checkout, mobile layouts, bookings and admin workflows.

## Method
1. Select a safe test or staging environment, test accounts and disposable data. Do not create real charges or send real messages.
2. Enumerate user-visible journeys, happy paths and failures, permissions, duplicate submissions and mobile layouts.
3. When Playwright or another supported browser runner is installed, script reproducible assertions, captures and cleanup.
4. Distinguish UI success from persistence/backend success; check the database or API with authorized evidence if possible.
5. Run tests and report environment, executed steps, observations, failing assertions, screenshots and cleanup.

## Requirements
A runnable app and browser/testing tool are necessary for actual end-to-end execution. This SKILL.md alone does not provide a browser or the Anthropic helper scripts.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
