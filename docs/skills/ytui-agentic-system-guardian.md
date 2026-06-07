# Skill: ytui-agentic-system-guardian

## Purpose

Validate that the dual-world agentic system (.opencode/ and .claude/) is complete and consistent after every change.

## Inputs

- .opencode/agents/, .opencode/commands/, .opencode/skills/ directory contents
- .claude/agents/, .claude/commands/, .claude/skills/ directory contents
- opencode.json build task allowlist
- docs/agents/agent-catalog.md
- docs/commands/command-catalog.md

## Steps

1. List all agents in .opencode/agents/ and .claude/agents/. Cross-check for missing files in either world.
2. List all commands in .opencode/commands/ and .claude/commands/. Cross-check for missing files in either world.
3. List all skills in .opencode/skills/ and .claude/skills/. Cross-check for missing directories in either world.
4. Diff each skill pair for content drift.
5. Validate .claude/ agent frontmatter: name field present, tools as comma string, no mode field.
6. Validate .opencode/ agent frontmatter: mode: subagent, tools as object with write/edit/bash booleans.
7. Check opencode.json build task allowlist against .opencode/agents/ file list.
8. Check docs/agents/agent-catalog.md against .opencode/agents/ file list.
9. Check docs/commands/command-catalog.md against .opencode/commands/ file list.
10. Verify this guardian (ytui-agentic-system-guardian) is present in all checked locations.

## Required Checks

- No agent missing from either world
- No command missing from either world
- No skill missing from either world
- No skill content drift between worlds
- All .claude/ agents have correct Claude Code frontmatter
- All .opencode/ agents have correct OpenCode frontmatter
- opencode.json allowlist is complete
- Both docs catalogs are complete
- Guardian validates itself

## Blocking Criteria

- Any agent, command, or skill missing from either world: critical
- Skill content drift: major
- Frontmatter schema violation: major
- Missing docs catalog entry: minor

## Outputs

- status: PASS | WARN | FAIL
- per-check findings with severity and file references
- remediation steps for each finding
- JSON summary block per docs/contracts/output-format.md

## Examples

- Run after adding a new guardian agent to verify both worlds were updated.
- Run before merge when any .opencode/ or .claude/ file was touched.
- Run on-demand with `/ytui-maintain-agentic-system validate`.
