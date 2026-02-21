# AGENTS.md

This file defines mandatory implementation rules for coding agents working in this repository.

## Project Goal

Build `ytui`, a scalable terminal music app with:
- MVP provider: YouTube
- Future provider extensibility (Spotify and others)
- Vim-inspired UX
- OpenTUI frontend
- Redux Toolkit store with thunks
- Plugin-capable architecture

## Non-Negotiable Architecture Rules

- Scalability first: prioritize extensibility over short-term hacks.
- No barrel exports:
  - Do NOT create `index.ts` re-export files.
  - Import modules directly by file path.
- Significant modules must live in their own folder.
  - Example: `src/components/sidebar/sidebar.ts`
  - Include `*.types.ts` and `__tests__/` in the same folder.
- Shared low-churn modules may remain flat:
  - `src/types/*`
  - `src/utils/*`

## Folder Conventions

- UI components: `src/components/<name>/`
- Layouts: `src/layouts/<name>/`
- Feature logic: `src/features/<name>/`
- Services/integrations: `src/services/<name>/`
- Registries: `src/registries/<name>/`
- State/store internals: `src/state/*`
- Shared contracts: `src/types/*`
- Shared helpers: `src/utils/*`

Each significant folder should contain:
- `<name>.ts`
- `<name>.types.ts`
- `__tests__/`

## Store and State Rules

- Use Redux Toolkit + thunks.
- Keep reducers pure.
- Keep side effects in thunks/services only.
- UI components must not call external processes directly.
- Use dynamic reducer manager for plugin slice injection.
- Plugin slices must be namespaced and must never override core slice keys.

## Service Boundary Rules

Use typed service interfaces for all external integrations:
- Search service
- Player service
- Cava/visualizer service
- Config service
- Provider manager

UI must consume state, not services directly.

## Provider Rules

- Architecture must be provider-capability-based.
- MVP active provider: `youtube`.
- Future providers must integrate via `MusicProvider` interfaces.
- Do not hardcode provider-specific behavior in UI components.

## Command System Rules

- Command system is registry-driven (no monolithic command `if/else` chains in app root).
- Commands must be composable and testable.
- Required MVP commands include:
  - `:q`
  - `:?`
  - `:sidebar on|off|toggle`
  - `:theme list|<name>`
  - `:progress list|<style>`
  - `:provider list|current|use <id>`
  - `:plugin list|info <id>|reload`

## Progress Styles

Progress style system must be registry-based and extensible.
MVP styles:
- `blocks`
- `dots`
- `braille`

Adding a new style should require only registering a new style definition.

## Theme System

Theme system must be token-based and registry-driven.
MVP themes:
- `gruvbox`
- `nord`
- `matrix`

No hardcoded UI colors in component logic beyond fallback safety.

## Config Rules

Config file location is mandatory:

`~/.config/ytui/ytui.conf`

Format:
- env-like `KEY="value"`
- comments with `#`

Behavior:
- Create file with defaults if missing.
- Unknown keys: ignore safely.
- Invalid values: fallback to defaults.
- Persist user changes for runtime-modifiable settings.

## Plugin System Rules

Plugins live under:

`~/.config/ytui/plugins/<plugin-id>/`

Manifest file:
- `plugin.json`

Required manifest fields:
- `id`
- `name`
- `version`
- `description` (mandatory)
- `apiVersion`
- `entry`

Plugin errors must not crash the app.
Plugin load status should be observable in app state.

## UX Rules

MVP views:
- `NORMAL`
- `SEARCH`
- `ZEN`

Help is modal (`:?`) and global.
Sidebar is controlled by command only (no dedicated keybind requirement).
ZEN content area should stay minimal.

## Testing Expectations

At minimum, maintain tests for:
- Reducer manager dynamic injection/removal
- Command parsing and command registry behavior
- Config parsing/validation
- Theme/progress registries
- Plugin manifest validation

## Operational Constraints

- Keep changes incremental and reversible.
- Do not introduce destructive commands.
- Do not add unrelated dependencies.
- Preserve existing user-authored behavior unless explicitly changing it.

## Documentation Sync Rules

- Any important code change MUST include corresponding docs updates in the same contribution.
- Important changes include:
  - Architecture or folder conventions
  - Store/slice/thunk/reducer-manager behavior
  - Commands, key UX flows, or modal behavior
  - Provider/plugin/config contracts
  - Any user-visible behavior or breaking change
- Required documentation paths are under `docs/` (agents, skills, commands, policies, workflows, contracts, templates as applicable).
- Contributions that change important code without docs updates are non-compliant and must be blocked.

## Decision Priority

When tradeoffs exist:
1. Scalability
2. Clear boundaries
3. Testability
4. UX consistency
5. Performance optimization
