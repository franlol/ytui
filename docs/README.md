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
- `registries/`: registry system docs (themes, progress styles, etc.).
- `features/`: feature slice state shape and action inventory docs.
- `components/`: shared component contracts (Modal base, etc.).

Executable agentic system definitions live in both runtime layers:
- `.opencode/agents/`
- `.opencode/commands/`
- `.opencode/skills/<name>/SKILL.md`
- `.claude/agents/`
- `.claude/commands/`
- `.claude/skills/<name>/SKILL.md`

Claude Code CLI is a supported contributor tool alongside OpenCode.
The `.claude/` directory is the Claude Code CLI adapter layer.
- `CLAUDE.md` is the Claude Code CLI entry point and delegates to `AGENTS.md`.
- `.claude/settings.json` is the shared Claude Code CLI permissions file for this repository.
- `.claude/settings.local.json`, when present, is for local Claude Code CLI overrides.

UI runtime note:
- Core app rendering uses `@opentui/react` with `react-redux` for store binding.
- Keep Redux Toolkit slices/thunks and service/provider boundaries unchanged when iterating on UI.
- YouTube playback uses a provider-backed playback service adapter (`mpv` backend); ensure `mpv` is available on PATH for audible playback.
- Real CAVA visualization is mpv-scoped and Linux-first (`pactl`/PulseAudio compatibility + `cava` required); on unsupported platforms/runtime it degrades gracefully without breaking playback.
- CAVA glyph rendering is registry-driven (`blocks`, `ascii`, `braille`) and can be switched at runtime with `:cava style list|<id>`.
- CAVA source mode is command/config driven: `:cava source list` and `:cava source <mode>` where `<mode>` is `ytui-strict` (default), `ytui-best-effort`, or `system`.
- `ytui-strict` disables visualizer when ytui-isolated source cannot be verified; `system` intentionally visualizes global system audio.
- NOW PLAYING progress bar supports click-to-seek; clicks outside the rendered bar are ignored and provider backends without seek capability fail with a status error.
- NOW PLAYING time/progress prefers runtime playback telemetry (`mpv` time-pos/duration via provider playback capability) and falls back to local tick updates only when runtime telemetry is unavailable.

Start here, then read `docs/policies/agent-only-contributions.md`.
