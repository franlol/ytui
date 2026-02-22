# Skill: ytui-ui-guardian

## Purpose

Protect MVP UX consistency.

## Inputs

- UI/layout changes
- command behavior affecting UX
- mode transition updates

## Steps

1. Validate NORMAL/SEARCH/ZEN behavior.
2. Validate help modal and command-line interaction.
3. Validate sidebar control contract.
4. Report user-visible regressions.

## Required Checks

- views: NORMAL, SEARCH, ZEN
- help remains modal via `:?`
- sidebar controlled by command
- statusline behavior remains Vim-like
- statusline feedback uses normalized severity prefixes (`OK:`, `ERR:`, `INFO:`) without duplicate labels
- statusline feedback color follows severity semantics with safe fallback behavior for themes without explicit severity tokens
- results/queue lists are viewport-safe (no overflow beyond panel height)
- SEARCH, NOW PLAYING, and CAVA panels keep fixed heights while results/queue consume remaining space
- NOW PLAYING renders title, author, and time+progress on separate lines without content overlap
- NOW PLAYING elapsed/duration reflects runtime playback state and must not freeze at stale metadata duration while audio continues
- NOW PLAYING progress seek is click-only on the rendered bar region; timestamp/prefix clicks are ignored safely
- on very small terminals, fixed panels remain visible first and results/queue may collapse when remaining height is below renderable minimum
- SEARCH height budget accounts for border + padding so CAVA keeps a visible gap above statusline
- UI state flow remains `react-redux` driven (no imperative render loop state syncing)
- playback UX remains coherent: `Enter` in NORMAL plays selected queue track, `Ctrl+P` in SEARCH plays selected result, `Space` pauses/resumes current track
- statusline keeps mode/command context on the left; transient feedback messages render in a side slot without replacing mode/command
- visualizer remains session-scoped to ytui playback (no global system-audio coupling) and unsupported runtime paths fail soft without UI crash
- visualizer glyph rendering remains registry-driven with safe fallback style behavior when style ids are unknown
- visualizer source-mode UX remains explicit: `ytui-strict` disables on failed isolation verification, `ytui-best-effort` warns, and `system` is opt-in global audio behavior

## Blocking Criteria

- broken mode transitions
- loss of required commands/help entry

## Outputs

- status (`PASS | WARN | FAIL`)
- UX findings with reproduction hints and file refs
- remediation actions

## Examples

- Review mode-cycle changes.
- Review statusline/command feedback updates.
