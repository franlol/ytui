# Skill: ytui-ui-guardian

## Purpose

Protect MVP UX consistency.

## Inputs

- UI/layout changes
- command behavior affecting UX
- mode transition updates

## Steps

1. Validate NORMAL/SEARCH/ZEN/LIBRARY/LOGS/SETTINGS behavior.
2. Validate help modal and command-line interaction.
3. Validate sidebar control contract.
4. Report user-visible regressions.

## Required Checks

- views: NORMAL, SEARCH, ZEN, LIBRARY, LOGS, SETTINGS
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
- playback UX remains coherent: `Enter` in NORMAL plays selected queue track, `Ctrl+P` in SEARCH plays selected result, `Space` in NORMAL/ZEN pauses/resumes current track, `Space` in SEARCH appends a space character to the query
- queue management keybinds are active only in NORMAL mode: `[n]gg` jumps to first (or nth) track, `[n]G` jumps to last (or nth) track, `[n]dd` removes n tracks from cursor (default 1); count prefix digits accumulate and reset on j/k or unrecognized sequence
- `Ctrl+A` in SEARCH enqueues the selected result without switching mode; bare `a` must still append to the search query
- `:queue clear` empties the queue and resets cursor to 0
- statusline keeps mode/command context on the left; transient feedback messages render in a side slot without replacing mode/command
- visualizer remains session-scoped to ytui playback (no global system-audio coupling) and unsupported runtime paths fail soft without UI crash
- visualizer glyph rendering remains registry-driven with safe fallback style behavior when style ids are unknown
- visualizer source-mode UX remains explicit: `ytui-strict` disables on failed isolation verification, `ytui-best-effort` warns, and `system` is opt-in global audio behavior
- `vol:` in the statusline reflects live mpv volume synced via the 750 ms telemetry tick; it must not display a static initial value while a track is playing
- results-list renders an animated spinner when `isLoading` is true; an empty list during an active search is a regression
- now-playing metadata (title/author) is set optimistically before audio initializes; a `null` now-playing after a failed play attempt is correct and expected
- the currently playing track is marked with a right-aligned `◆` at the end of its title line in both results-list (SEARCH) and queue-list (NORMAL); the title is padded so `◆` lands at `widthCols - 1`; the marker must be absent when `playback.nowPlaying` is null
- `playback.nowPlaying` is cleared (set to null) after 3 consecutive unavailable sync ticks (~2.25 s); during the 2-tick grace period elapsed time ticks normally; a stuck `◆` after track end is a regression
- theme picker opens as an absolute overlay on `:theme pick`; j/k/down/up navigate and apply live preview via `settingsActions.setTheme`; Escape restores `themePickerPreviousId` and closes; Enter confirms and closes; theme picker blocks all other key routes while open
- HelpModal uses `Modal` base with `strategy: "centered"`, `widthFraction=0.68`, `minWidth=48`, `heightFraction=0.6`; ThemePicker uses `Modal` base with `strategy: "centered"`, `width=60`, `heightFraction=0.6`
- all overlay components must use the shared `Modal` container (`src/components/modal/modal.tsx`); direct inline-chrome overlays are a regression
- LOGS mode: `j`/`k` scroll entries one row at a time, `G` (shift+g) calls `logsActions.jumpToBottom()` and resumes follow mode; `Ctrl+D`/`Ctrl+U` page down/up by 10 rows; title bar shows `LOGS (N) [FOLLOW]` when `scrollOffset >= entries.length - 1`, `LOGS (N)` otherwise
- Tab cycle includes SETTINGS: search → normal → zen → library → logs → settings → search (forward); Shift+Tab cycles in reverse: search → settings → logs → library → zen → normal → search; both use `cycleMode` / `cycleModeBack` reducers from the UI slice
- SETTINGS mode: `h`/`l` move between category tabs (`moveSettingsCategoryPrev` / `moveSettingsCategoryNext`); `j`/`k` move between items in the active category (`moveSettingsItemDown` / `moveSettingsItemUp`); `←`/`→` trigger `onChange` with direction `-1`/`+1` on the selected item; changes dispatch immediately and are persisted via `saveConfigThunk` on `Esc`; `Esc` exits SETTINGS and resets navigation (`resetSettingsNavigation`); SETTINGS mode does not support command input while active
- `:logs` switches to LOGS mode; `:logs clear` clears all entries and resets `scrollOffset` to 0
- follow mode is implicit (no Redux flag): new entries auto-advance `scrollOffset` only when already at bottom; manual scroll up breaks follow mode; `G` restores it

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
