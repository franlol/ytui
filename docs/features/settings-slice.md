# Settings Slice

Manages all user-configurable application settings that are persisted to `~/.config/ytui/ytui.conf`.

**File:** `src/features/settings/settings.slice.ts`  
**State type:** `src/features/settings/settings.types.ts`  
**Thunks:** `src/features/settings/settings.thunks.ts`

## State Shape

```typescript
type SettingsState = {
  themeId: string
  progressStyleId: string
  cavaStyleId: string
  cavaSourceMode: "ytui-strict" | "ytui-best-effort" | "system"
  resultsLimit: number        // 10–100
  cavaEnabled: boolean
  cavaHeight: number          // 1–8
  statusTimeoutMs: number     // 500–10000
  useAlternateScreen: boolean
  defaultMode: Mode           // excludes "settings" for persistence
}
```

## Actions

| Action | Payload | Effect |
|---|---|---|
| `applyConfig` | `AppConfig` | Bulk-loads all settings from disk config on startup |
| `setTheme` | `string` | Sets active theme id |
| `setProgressStyle` | `string` | Sets active progress bar style id |
| `setCavaStyle` | `string` | Sets active visualizer glyph style id |
| `setCavaSourceMode` | `"ytui-strict" \| "ytui-best-effort" \| "system"` | Sets CAVA audio capture mode |
| `setDefaultMode` | `Mode` | Sets the startup mode |
| `setCavaEnabled` | `boolean` | Enables or disables the CAVA visualizer |
| `setCavaHeight` | `number` | Sets visualizer row count, clamped to 1–8 |
| `setResultsLimit` | `number` | Sets max search results, clamped to 10–100 |
| `setStatusTimeout` | `number` | Sets status bar duration in ms, clamped to 500–10000 |
| `setUseAlternateScreen` | `boolean` | Enables or disables terminal alternate screen (effective on restart) |

## Thunks

### `saveConfigThunk`

Reads the full current state via `getState()` and writes it to disk via `configService.save()`. Called immediately after every setting change dispatched from the SETTINGS screen keyboard handler in `app-root.tsx`.

```
Setting changed (← / → in SETTINGS mode)
  → onChange closure dispatches slice action (e.g. setTheme, setCavaEnabled)
  → Redux applies action synchronously
  → saveConfigThunk() dispatched
  → getState() sees new value
  → configService.save() writes ~/.config/ytui/ytui.conf
```

This ensures changes persist even if the app dies before a clean quit.

`destroy()` in `create-app.tsx` dispatches `saveConfigThunk` (single source of truth for config serialization) as a safety net for state changed outside the SETTINGS screen (sidebar collapse, theme picker, etc.). `destroy()` runs on `:q`, on `Ctrl+C` (routed through the app keyboard handler — opentui's `exitOnCtrlC` is disabled), and on `SIGINT`/`SIGTERM`; it is guarded against re-entry.

`PLUGINS` and `PLUGINS_ENABLED` are round-tripped: `create-app.tsx` stores the loaded values in the plugins slice (`pluginsActions.setPluginConfig`) at startup, and `saveConfigThunk` writes them back from `state.plugins.configuredIds` / `state.plugins.pluginsEnabled`. Config saves must never reset the user's plugin configuration.

## Config persistence notes

- Provider switching uses `switchActiveProviderThunk` (`src/features/provider/provider.thunks.ts`) which calls both `providerManager.setActive(id)` and `providerActions.setActiveProvider(id)`. Dispatching `providerActions.setActiveProvider` directly is incorrect — it updates Redux but leaves the providerManager's in-memory `activeProviderId` stale, so search and playback continue using the old provider.
- `defaultMode: "settings"` is coerced to `"normal"` on save — the app never starts in SETTINGS mode.
- `AppConfig.defaultMode` accepts `"normal" | "search" | "zen" | "library" | "logs"` (defined in `src/types/config.types.ts`). `"settings"` is intentionally excluded.
- `parseConfig` in `config.service.ts` validates `defaultMode` against the same set; unrecognised values fall back to `"normal"`.
