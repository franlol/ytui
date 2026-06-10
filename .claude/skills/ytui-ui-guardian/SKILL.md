---
name: ytui-ui-guardian
description: Validate core UX invariants across NORMAL, SEARCH, ZEN, and help modal
metadata:
  scope: ui
  priority: medium
---
## What this skill does

- Verifies required views and transitions.
- Ensures command mode and help modal behavior remain coherent.
- Flags user-visible regressions.
- Verifies statusline severity text is normalized to `OK:`, `ERR:`, `INFO:` without duplicate prefixes.
- Verifies statusline severity colors resolve automatically with safe fallbacks when themes omit explicit severity tokens.
- Verifies list panels remain viewport-safe and do not overflow container bounds.
- Verifies fixed-height panel constraints for SEARCH, NOW PLAYING, and CAVA with results/queue filling remaining space.
- Verifies NOW PLAYING title, author, and time+progress lines remain width-safe and non-overlapping.
- Verifies NOW PLAYING click-to-seek is limited to the rendered progress bar region and ignores timestamp/prefix clicks.
- Verifies NOW PLAYING elapsed/duration follows runtime playback telemetry and does not freeze at stale metadata duration.
- Verifies fixed panels take precedence in very small viewports and list panels may collapse if remaining space is insufficient.
- Verifies SEARCH panel height budgeting includes its chrome so CAVA does not touch the statusline.
- Verifies UI behavior is driven through `@opentui/react` + `react-redux` state flow, not imperative render-loop syncing.
- Verifies playback controls are discoverable and coherent (`Enter` NORMAL play, `Ctrl+P` SEARCH play, `Space` in NORMAL/ZEN pause/resume, `Space` in SEARCH appends to query).
- Verifies queue management keybinds are NORMAL-mode-only: `[n]gg` → first/nth track, `[n]G` → last/nth track, `[n]dd` → remove n tracks from cursor; count digits accumulate and reset on j/k or unrecognized key.
- Verifies `Ctrl+A` in SEARCH enqueues selected result without mode switch; bare `a` must still append to the search query.
- Verifies `:queue clear` empties the queue and resets cursor to 0.
- Verifies statusline preserves left mode/command context while feedback messages render in a side slot.
- Verifies visualizer behavior stays scoped to active ytui playback session and unsupported runtime paths degrade gracefully.
- Verifies visualizer glyph style behavior remains registry-driven with deterministic fallback for unknown style ids.
- Verifies visualizer source-mode UX is explicit (`ytui-strict`, `ytui-best-effort`, `system`) with correct warning/disable behavior.
- Verifies statusline `vol:` reflects live mpv volume synced via the 750 ms telemetry tick and does not display a static initial value during active playback.
- Verifies results-list renders an animated spinner (not an empty list) when `isLoading` is true.
- Verifies optimistic now-playing: track metadata appears immediately on play initiation; `null` now-playing after a failed play is expected behavior, not a regression.
- Verifies the currently playing track is marked with a right-aligned `◆` in results-list and queue-list; marker absent when `playback.nowPlaying` is null; queue-list additionally requires the track at `playingIndex` to match `playback.nowPlaying.id` (`isQueueTrackPlaying`) so a stale `playingIndex` never shows a marker; `◆` clears after 3 consecutive unavailable sync ticks (~2.25 s).
- Verifies theme picker Escape restores `themePickerPreviousId` and closes; Enter confirms without re-dispatching.
- Verifies HelpModal and ThemePicker both use the shared `Modal` container (`src/components/modal/modal.tsx`); direct inline-chrome overlays are a regression.
- Verifies HelpModal uses `strategy: "centered"` with content-fit sizing (width min 48 / max 82, height = content + chrome, capped to the screen) and ThemePicker uses `strategy: "centered"` with `heightFraction=0.6`.
- Verifies the help modal documents all six modes and the complete keymap/command set; a feature shipped without a help entry is a discoverability regression.
- Verifies every statusline message auto-clears after `settings.statusTimeoutMs` via the status-timeout listener middleware (`src/state/status-timeout/status-timeout.ts`); component-level status timers are a regression.
- Verifies command-mode input preempts SETTINGS navigation keys (the `commandActive` block runs before the settings key handler in `app-root.tsx`).
- Verifies `Ctrl+C` quits through the full cleanup path (`requestQuit` → `destroy`); opentui `exitOnCtrlC` stays disabled and `SIGINT`/`SIGTERM` route to the same `destroy`.
- Verifies mode-switch commands exist for every view: `:normal`, `:search`, `:zen`, `:library`, `:logs`, `:settings`.

## When to use

- UI layout or interaction changes
- Command UX updates
