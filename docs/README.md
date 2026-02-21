# Docs

This directory contains the agentic operating system for `ytui`.

Quick start for contributors: `docs/quickstart-agentic-iteration.md`

- `agents/`: agent governance and execution model.
- `skills/`: reusable skill definitions.
- `commands/`: slash command specs.
- `contracts/`: required output and severity schemas.
- `policies/`: contribution and trust policies.
- `workflows/`: end-to-end lifecycle flows.
- `templates/`: report/checklist templates.

Executable OpenCode runtime definitions live in `.opencode/`:
- `.opencode/agents/`
- `.opencode/commands/`
- `.opencode/skills/<name>/SKILL.md`

UI runtime note:
- Core app rendering uses `@opentui/react` with `react-redux` for store binding.
- Keep Redux Toolkit slices/thunks and service/provider boundaries unchanged when iterating on UI.

Start here, then read `docs/policies/agent-only-contributions.md`.
