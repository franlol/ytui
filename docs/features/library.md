# Library

Manages user playlists, track collections, and playback history.

**Slice file:** `src/features/library/library.slice.ts`  
**State type:** `src/features/library/library.types.ts`  
**Thunks:** `src/features/library/library.thunks.ts`  
**Service:** `src/services/library/library.service.ts`  
**Persistence:** `~/.config/ytui/library.json`

## State Shape

```typescript
type LibraryState = {
  playlists: Playlist[]
  selectedPlaylistIndex: number
  selectedTrackIndex: number
  focus: "playlists" | "tracks"
}

type Playlist = {
  id: string
  name: string
  tracks: Track[]
  readonly?: boolean
}
```

## Built-in Playlists

Two playlists are always present and cannot be deleted or renamed (`readonly: true`):

| ID | Name | Behavior |
|---|---|---|
| `saved` | Saved | User-managed; tracks added via `Ctrl+S` playlist picker |
| `history` | History | Auto-populated on every track play; capped at 100 entries; deduplicates (most recent occurrence kept) |

## Actions

| Action | Payload | Effect |
|---|---|---|
| `setPlaylists` | `Playlist[]` | Replaces the full playlist list (used on load) |
| `setFocus` | `"playlists" \| "tracks"` | Switches the active panel focus |
| `movePlaylistDown` | — | Increments `selectedPlaylistIndex`, clamped to last |
| `movePlaylistUp` | — | Decrements `selectedPlaylistIndex`, clamped to 0 |
| `moveTrackDown` | — | Increments `selectedTrackIndex`, clamped to last |
| `moveTrackUp` | — | Decrements `selectedTrackIndex`, clamped to 0 |
| `addTrackToPlaylist` | `{ playlistId, track }` | Appends track to the given playlist (no-op if already present) |
| `removeTrackFromPlaylist` | `{ playlistId, trackId }` | Removes track by id from the given playlist |
| `createPlaylist` | `{ id, name }` | Appends a new user playlist |
| `deletePlaylist` | `string` (id) | Removes a user playlist; no-op on readonly playlists |
| `renamePlaylist` | `{ id, name }` | Renames a user playlist; no-op on readonly playlists |
| `prependToHistory` | `Track` | Removes any existing entry for the track, prepends it, trims list to 100 |

## Thunks

| Thunk | Effect |
|---|---|
| `loadLibraryThunk` | Reads `~/.config/ytui/library.json` via `libraryService`; dispatches `setPlaylists` |
| `saveLibraryThunk` | Writes current `state.library.playlists` to `~/.config/ytui/library.json` via `libraryService` |

`saveLibraryThunk` is dispatched after every mutation that should persist: add/remove track, create/delete/rename playlist, and on playback (history update).

## Persistence Contract

File: `~/.config/ytui/library.json`

- Created automatically on first save if absent.
- Format: JSON array of `Playlist` objects.
- On load: saved data is merged over the default built-in playlists. Built-in playlists retain `readonly: true` regardless of file contents.
- On load error: defaults silently (empty user playlists, intact built-ins).

## LIBRARY Mode

Activated by pressing `Tab` (cycles `normal → search → zen → library → logs → normal`) or `Shift+Tab` (reverse: `normal → logs → library → zen → search → normal`), or `:library` (not a registered command — use `Tab`).

The LIBRARY screen is a two-panel layout:
- **Left panel** (fixed 24 cols): playlist list
- **Right panel** (fills remaining width): track list for the selected playlist

Panel with active focus shows an accented border. The unfocused panel uses a flat/dim border and a flat selection background.

### Keybinds

| Keybind | Action |
|---|---|
| `h` / `←` | Focus playlist panel |
| `l` / `→` | Focus track panel |
| `j` / `↓` | Move selection down in focused panel |
| `k` / `↑` | Move selection up in focused panel |
| `Enter` | If playlist focused: dive into tracks panel. If track focused: play selected track |
| `Ctrl+P` | Play selected track (works from either panel) |
| `Ctrl+A` | Enqueue selected track |
| `Ctrl+S` | Open playlist picker to save selected track to another playlist |
| `dd` | Remove selected track from current playlist (track panel only); two-key sequence |

`dd` uses a pending-key ref (`libraryKeyPendingRef`): first `d` sets pending, second `d` executes. Any other key after `d` cancels the sequence and is handled normally.

The `history` playlist is read-only: `dd` is a no-op there.

## Commands

| Command | Effect |
|---|---|
| `:playlist new <name>` | Creates a new playlist; `<name>` may be multi-word (use quotes if spaces: `"Summer Hits"`) |
| `:playlist delete <name>` | Deletes a user playlist by display name; built-in playlists are rejected |
| `:playlist rename <name> <new name>` | Renames a user playlist; first token is old name, rest is new name |

Names with spaces must be quoted in commands: `:playlist rename "Summer Hits" "New Name"`.  
The command parser tokenizes `"quoted strings"` as single arguments.

### Readonly Guard

`:playlist delete` and `:playlist rename` on `Saved` or `History` respond with:
```
ERR: "<name>" is a built-in playlist
```
