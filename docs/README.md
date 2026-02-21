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
- YouTube playback uses a provider-backed playback service adapter (`mpv` backend); ensure `mpv` is available on PATH for audible playback.
- Real CAVA visualization is mpv-scoped and Linux-first (`pactl`/PulseAudio compatibility + `cava` required); on unsupported platforms/runtime it degrades gracefully without breaking playback.
- CAVA glyph rendering is registry-driven (`blocks`, `ascii`, `braille`) and can be switched at runtime with `:cava style list|<id>`.

Start here, then read `docs/policies/agent-only-contributions.md`.
