# Curated agent skills — local adaptations

These are **10 original, lightweight Codex-compatible SKILL.md adapters** based on the *ideas* and workflows of the linked projects. They are **not verbatim installations** of the upstream skill packages, nor do they bundle vendor reference folders, CLIs, tests or scripts.

They can guide Codex within this GitHub project. To obtain an upstream skill's **full package**, separately review its official repository and install it into the actual agent runtime, including its dependencies. None of those external tools was run or installed by this commit.

## Scope and safety

- Each skill is invoked only when its description matches the task; don't use all ten for every edit.
- Avoid production modifications, payment actions, external browsing, automation, deployments and secrets changes without explicit permission.
- Preserve the project-specific **pragmatic-design-patterns** skill and existing AGENTS.md instructions.
- Sources should be reviewed for new versions before copying scripts or commands.
- Report honestly when tests, browsers, native tools or external runtimes are not available.

| Skill | Official upstream source |
| --- | --- |
| [supabase-practices](./supabase-practices/SKILL.md) | https://github.com/supabase/agent-skills |
| [vercel-react-best-practices](./vercel-react-best-practices/SKILL.md) | https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices |
| [superpowers-workflow](./superpowers-workflow/SKILL.md) | https://github.com/obra/superpowers |
| [webapp-testing](./webapp-testing/SKILL.md) | https://github.com/anthropics/skills/tree/main/skills/webapp-testing |
| [security-review](./security-review/SKILL.md) | https://github.com/getsentry/skills/tree/main/skills/security-review |
| [frontend-design](./frontend-design/SKILL.md) | https://github.com/anthropics/skills/tree/main/skills/frontend-design |
| [web-quality](./web-quality/SKILL.md) | https://github.com/addyosmani/web-quality-skills |
| [domain-modeling](./domain-modeling/SKILL.md) | https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling |
| [agent-browser-guide](./agent-browser-guide/SKILL.md) | https://github.com/vercel-labs/agent-browser |
| [prisma-best-practices](./prisma-best-practices/SKILL.md) | https://github.com/prisma/skills |

## Suggested priorities in this repository

Frontend design, web quality, React, webapp-testing, security-review and Supabase. Prisma only if adopted.
