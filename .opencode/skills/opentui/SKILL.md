---
name: opentui
description: Build terminal UIs with OpenTUI. Covers the core API, native audio, keymaps, React and Solid bindings, components, layout, keyboard input, plugins, and testing.
---

# OpenTUI Skill

Canonical reference docs are authored once in the Claude skill mirror at `.claude/skills/opentui/docs/**/*.mdx` (relative to the repo root).

## Path invariant

- All doc slugs map to `.claude/skills/opentui/docs/<slug>.mdx` from the repo root.
- In the upstream OpenTUI repo the same slug maps to `packages/web/src/content/docs/<slug>.mdx`.

## Reading order by area

- Getting started: `.claude/skills/opentui/docs/getting-started.mdx`
- Core: `.claude/skills/opentui/docs/core-concepts/renderer.mdx`
- Testing: `.claude/skills/opentui/docs/core-concepts/testing.mdx`
- Audio: `.claude/skills/opentui/docs/core-concepts/audio.mdx`
- Keymap: `.claude/skills/opentui/docs/keymap/overview.mdx`
- React: `.claude/skills/opentui/docs/bindings/react.mdx`
- Solid: `.claude/skills/opentui/docs/bindings/solid.mdx`
- Components: `.claude/skills/opentui/docs/components/text.mdx`, `.claude/skills/opentui/docs/components/input.mdx`
- Layout: `.claude/skills/opentui/docs/core-concepts/layout.mdx`
- Keyboard: `.claude/skills/opentui/docs/core-concepts/keyboard.mdx`
- Plugins: `.claude/skills/opentui/docs/plugins/slots.mdx`
- Reference: `.claude/skills/opentui/docs/reference/env-vars.mdx`

## Quick routing by intent

| Intent(s)                                                  | Start here                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `getting-started`, `installation`, `quickstart`, `intro`   | `.claude/skills/opentui/docs/getting-started.mdx`                 |
| `core`, `renderer`, `terminal`, `scrollback`, `lifecycle`  | `.claude/skills/opentui/docs/core-concepts/renderer.mdx`          |
| `audio`, `native-audio`, `sound`, `playback`, `pcm`, `fft` | `.claude/skills/opentui/docs/core-concepts/audio.mdx`             |
| `keymap`, `keybindings`, `shortcuts`, `commands`, `leader` | `.claude/skills/opentui/docs/keymap/overview.mdx`                 |
| `layout`, `flexbox`, `yoga`, `positioning`                 | `.claude/skills/opentui/docs/core-concepts/layout.mdx`            |
| `keyboard`, `input`, `keybindings`, `paste`, `focus`       | `.claude/skills/opentui/docs/core-concepts/keyboard.mdx`          |
| `testing`, `test-renderer`, `snapshots`, `frames`          | `.claude/skills/opentui/docs/core-concepts/testing.mdx`           |
| `react`, `jsx`, `hooks`, `animation`, `testing`            | `.claude/skills/opentui/docs/bindings/react.mdx`                  |
| `solid`, `signals`, `jsx`, `hooks`, `animation`, `testing` | `.claude/skills/opentui/docs/bindings/solid.mdx`                  |
| `plugins`, `plugin`, `slots`, `registry`, `extensions`     | `.claude/skills/opentui/docs/plugins/slots.mdx`                   |
| `text`, `styling`, `content`, `selection`                  | `.claude/skills/opentui/docs/components/text.mdx`                 |
| `input`, `form`, `editing`, `focus`                        | `.claude/skills/opentui/docs/components/input.mdx`                |
| `env`, `environment`, `configuration`, `flags`             | `.claude/skills/opentui/docs/reference/env-vars.mdx`              |

## Working rules

- Read docs at `.claude/skills/opentui/docs/` (from repo root) — this is the single-source copy shared across both worlds.
- Prefer the entry pages listed above first, then narrow into sub-pages in the same section.
- Use stable `.claude/skills/opentui/docs/...` paths when cross-referencing.
