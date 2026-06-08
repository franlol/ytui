# UI Slice

Manages all transient UI state that does not belong to a specific feature slice.

**File:** `src/features/ui/ui.slice.ts`  
**State type:** `src/features/ui/ui.types.ts`

## State Shape

```typescript
type UiState = {
  mode: "normal" | "search" | "zen" | "library" | "logs"
  sidebarCollapsed: boolean
  commandActive: boolean
  commandBuffer: string
  helpOpen: boolean
  themePickerOpen: boolean
  themePickerSelectedIndex: number
  themePickerPreviousId: string
  playlistPickerOpen: boolean
  playlistPickerSelectedIndex: number
  statusMessage: string | null
  statusLevel: "ok" | "err" | "info" | null
}
```

## Actions

| Action | Payload | Effect |
|---|---|---|
| `setMode` | `Mode` | Sets the active view mode |
| `cycleMode` | — | Cycles search → normal → zen → library → logs → search (forward) |
| `cycleModeBack` | — | Cycles search → logs → library → zen → normal → search (reverse) |
| `setSidebarCollapsed` | `boolean` | Collapses/expands the sidebar |
| `setCommandActive` | `boolean` | Opens/closes command input |
| `setCommandBuffer` | `string` | Updates the in-progress command string |
| `setHelpOpen` | `boolean` | Opens/closes the help modal |
| `openThemePicker` | `{ selectedIndex, previousId }` | Opens theme picker at the given index, saving the current theme id for Escape restoration |
| `closeThemePicker` | — | Closes the theme picker |
| `moveThemePickerDown` | `number` (theme count) | Increments `themePickerSelectedIndex`, clamped to `count - 1` |
| `moveThemePickerUp` | — | Decrements `themePickerSelectedIndex`, clamped to `0` |
| `openPlaylistPicker` | `number` (initial index) | Opens playlist picker at the given index |
| `closePlaylistPicker` | — | Closes the playlist picker |
| `movePlaylistPickerDown` | `number` (pickable count) | Increments `playlistPickerSelectedIndex`, clamped to `count - 1` |
| `movePlaylistPickerUp` | — | Decrements `playlistPickerSelectedIndex`, clamped to `0` |
| `setStatus` | `{ message, level }` | Sets a transient status message |
| `clearStatus` | — | Clears the status message |

## Overlay Lifecycle: Theme Picker

```
:theme pick dispatched
  → openThemePicker({ selectedIndex: <current>, previousId: <current id> })
  → themePickerOpen = true

j / k
  → moveThemePickerDown(count) or moveThemePickerUp()
  → settingsActions.setTheme(newId)        ← live preview

Escape
  → settingsActions.setTheme(themePickerPreviousId)   ← restore
  → closeThemePicker()

Enter
  → closeThemePicker()                     ← confirm (theme already applied)
```

`themePickerPreviousId` and `themePickerSelectedIndex` are only meaningful while `themePickerOpen` is true. They are not reset on close — stale values are overwritten by the next `openThemePicker` call.

## Overlay Lifecycle: Playlist Picker

Opens when the user presses `Ctrl+S` in NORMAL, SEARCH, or LIBRARY mode. A `pendingTrackRef` in `app-root.tsx` holds the track to save while the picker is open.

```
Ctrl+S pressed (NORMAL / SEARCH / LIBRARY)
  → pendingTrackRef.current = selectedTrack
  → openPlaylistPicker(0)
  → playlistPickerOpen = true

j / k
  → movePlaylistPickerDown(count) or movePlaylistPickerUp()

Enter
  → libraryActions.addTrackToPlaylist({ playlistId: target.id, track })
  → saveLibraryThunk()
  → closePlaylistPicker()
  → pendingTrackRef.current = null

Escape
  → closePlaylistPicker()
  → pendingTrackRef.current = null
```

The picker list excludes the `"history"` playlist (History is auto-managed). `playlistPickerSelectedIndex` is not reset on close — overwritten by the next `openPlaylistPicker` call.

## Overlay Preemption Order

Only one overlay may be open at a time. Keyboard events are consumed by the first matching condition:

```
helpOpen → themePickerOpen → playlistPickerOpen → commandActive → mode routing
```
