---
name: ytui-agentic-system-guardian
description: Validate dual-world agentic system consistency between .opencode/ and .claude/
metadata:
  scope: agentic-system
  priority: high
---
## What this skill does

- Audits both .opencode/ and .claude/ adapter layers for completeness and consistency.
- Flags missing adapters, schema violations, and skill content drift between worlds.
- Validates opencode.json allowlist and docs catalog completeness.
- Validates the guardian itself is present in both worlds (dog-fooding).
- Produces PASS/WARN/FAIL with precise file references.

## When to use

- After adding or modifying any agent, command, or skill
- Before merge when agentic system files were touched
- On-demand dual-world consistency audit
