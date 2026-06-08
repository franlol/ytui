# Logs

The logs screen is a read-only activity feed that captures structured events emitted by app services. It is a developer and power-user tool for diagnosing playback, search, plugin, and config issues without leaving the terminal.

**Files:**
- Slice: `src/features/logs/logs.slice.ts`
- Types: `src/features/logs/logs.slice.types.ts`
- Component: `src/components/logs-panel/logs-panel.tsx`
- Logger service: `src/services/logger/logger.ts`

## Mode

`logs` is a first-class `Mode` (added to the `Mode` union in `src/types/app.types.ts`). It is reachable via:
- `Tab` cycle: normal → search → zen → library → **logs** → normal
- `:logs` command
- Sidebar navigation

## State Shape

```typescript
type LogEntry = {
  id: string       // monotonically-incrementing string id
  timestamp: number
  level: "info" | "warn" | "error" | "debug"
  source: string   // e.g. "playback", "search", "plugin:foo"
  message: string
}

type LogsState = {
  entries: LogEntry[]
  scrollOffset: number  // index of the last visible row
  maxEntries: number    // ring buffer cap, default 500
}
```

## Follow Mode

Follow mode is **implicit**: the panel is in follow mode whenever `scrollOffset >= entries.length - 1`. When a new entry arrives and `scrollOffset` is already at the bottom, the reducer auto-advances `scrollOffset` to track it. When the user scrolls up manually, follow mode pauses. Pressing `G` (`:logs` panel) calls `jumpToBottom()` to resume.

The title bar displays `LOGS (N) [FOLLOW]` when at the bottom, and `LOGS (N)` otherwise.

## Ring Buffer

The reducer enforces `maxEntries` (default 500). When the cap is reached, the oldest entry is shifted out and `scrollOffset` is decremented by 1 to keep the viewport stable.

## Actions

| Action | Payload | Effect |
|---|---|---|
| `addEntry` | `{ level, source, message }` | Appends entry, advances offset if at bottom, caps at `maxEntries` |
| `scrollDown` | — | Increments `scrollOffset`, capped at `entries.length - 1` |
| `scrollUp` | — | Decrements `scrollOffset`, floored at `0` |
| `scrollPageDown` | `number` (page size) | Jumps `scrollOffset` forward by page size |
| `scrollPageUp` | `number` (page size) | Jumps `scrollOffset` back by page size |
| `jumpToBottom` | — | Sets `scrollOffset` to `entries.length - 1` |
| `clearLogs` | — | Empties `entries`, resets `scrollOffset` to `0` |

## Logger Service

`src/services/logger/logger.ts` implements `ILogger` (`src/services/logger/logger.types.ts`). It wraps `dispatch(logsActions.addEntry(...))`.

```typescript
const logger = new Logger(store.dispatch)
logger.info("search", "query returned 20 results")
logger.error("plugin:foo", "failed to load manifest")
```

The `Logger` instance is created in `create-app.tsx` after the store is initialized. Pass it to any service or thunk that needs structured logging.

## Key Bindings (logs mode)

| Key | Action |
|-----|--------|
| `j` / `↓` | Scroll down one entry |
| `k` / `↑` | Scroll up one entry |
| `Ctrl+d` | Page down (10 rows) |
| `Ctrl+u` | Page up (10 rows) |
| `G` (shift+g) | Jump to bottom and resume follow mode |

## Commands

| Command | Effect |
|---------|--------|
| `:logs` | Switch to logs mode |
| `:logs clear` | Clear all log entries |

## Emission Map

The following call sites emit log entries. Thunks dispatch `logsActions.addEntry` directly; startup entries use the `Logger` service instance in `create-app.tsx`.

| Source | Level | When |
|--------|-------|------|
| `app` | info | App started |
| `config` | info | Config file loaded (theme, provider) |
| `provider` | info | Active provider set |
| `plugin:<id>` | info | Plugin loaded successfully |
| `plugin:<id>` | error | Plugin manifest invalid or failed to load |
| `plugin:<id>` | debug | Plugin disabled (not in enabled list) |
| `playback` | info | Track play initiated (`play: "title" [id]`) |
| `playback` | error | Play failed (stream error, provider error) |
| `playback` | error | Pause/resume failed |
| `playback` | error | Seek failed |
| `search` | info | Search completed (`"query" → N results`) |
| `search` | error | Search failed (includes original query) |
| `visualizer` | info | CAVA started successfully (includes source mode) |
| `visualizer` | warn | CAVA source unavailable |
| `visualizer` | warn | ytui-strict isolation check failed |
| `visualizer` | warn | best-effort source unverified |
| `visualizer` | error | CAVA runtime error callback fired |
| `visualizer` | error | CAVA start() threw |
| `library` | error | Library load failed |
| `library` | error | Library save failed |

**Not logged by design:** 750 ms sync ticks, visualizer bar updates, individual keystrokes, statusline set/clear, queue mutations, mode transitions.

## Component: LogsPanel

`src/components/logs-panel/logs-panel.tsx` renders a windowed view of entries using plain `<box>` + `<text>` elements (no scrollbox, no refs). The visible window is computed from `scrollOffset`:

```
windowEnd   = min(total, scrollOffset + 1)
windowStart = max(0, windowEnd - contentHeight)
visible     = entries.slice(windowStart, windowEnd)
```

Each row is colored by log level using theme tokens:
- `error` → `theme.statusErrText`
- `warn` → `theme.statusInfoText`
- `info` → `theme.text`
- `debug` → `theme.muted`

Row format: `HH:MM:SS  LVL  source        message`
