# /ytui-maintain-agentic-system

## Purpose

Validate dual-world agentic system consistency between .opencode/ and .claude/. Run after any agent, command, or skill is added or modified.

## Inputs

- Optional goal argument: validate | add agent <name> | add command <name> | add skill <name>

## Skills

- `ytui-agentic-system-guardian`

## Blocking Checks

- Agent missing from either world
- Command missing from either world
- Skill missing from either world
- Skill content drift between .opencode/ and .claude/ copies
- Schema violation in agent frontmatter
- opencode.json allowlist incomplete
- docs catalogs incomplete

## Required Output

- per-check findings with severities and file refs
- remediation steps
- PASS/WARN/FAIL
