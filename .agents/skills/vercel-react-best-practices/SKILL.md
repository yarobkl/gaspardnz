---
name: vercel-react-best-practices
description: Review React and Next.js components for performance, rendering, accessibility and bundle quality without altering product behavior.
---

# vercel-react-best-practices

> Local Codex-compatible adaptation, **not** the complete upstream installation. Source: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices

## Use it for
React/Vite and Next.js performance work, unnecessary rerenders, waterfalls, bundle size, page responsiveness.

## Method
1. Identify the actual rendering or loading bottleneck; collect a trace, build stats or performance measurement when possible.
2. Check serial data fetching and waterfalls, excess client JavaScript, heavy dependencies and unnecessary effects.
3. Apply the simplest fix: concurrent fetch, safe lazy loading, memoization only with measured benefit, stable identities when necessary.
4. Preserve accessibility, behavior, caching semantics, SEO and existing UI.
5. Compare before/after with the same test scenario; run typecheck and build where available.

## Guardrails
Don't add useMemo/useCallback everywhere. Don't claim a speedup without measurement. Note React/Vite vs Next.js differences.

## Completion contract
Summarize the concrete change or assessment, evidence and commands run, tests passed/failed/not run, risks and next step. Never state that third-party tools or browser automation ran unless they actually ran.
