---
name: web-quality
description: Audit Core Web Vitals, accessibility and SEO with evidence, then implement the smallest improvements that matter.
---

# web-quality

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/addyosmani/web-quality-skills

## Use it for
Lighthouse, SEO indexing, Core Web Vitals, mobile responsiveness, accessibility and technical site quality.

## Method
1. Identify the target routes and the metric or user problem, e.g. LCP, INP, CLS, crawlability or WCAG failures.
2. Prefer real-user data when available; clearly label lab Lighthouse/DevTools findings vs field data.
3. Review metadata, headings, robots/canonical, structured data, alt text, interaction and keyboard behavior.
4. Prioritize issues by user impact, confidence, effort and risk, and preserve currently working SEO routes.
5. Make focused changes, rerun equivalent measurements and report numeric before/after only if obtained.

## Requirements
Lighthouse, DevTools or equivalent browser tooling is needed for real performance audits. Otherwise report source-level observations, not measured scores.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
