# Queue Slice

Manages the list of tracks queued for playback and the cursor position within it.

**File:** `src/features/queue/queue.slice.ts`  
**State type:** `src/features/queue/queue.types.ts`

## State Shape

```typescript
type QueueState = {
  tracks: Track[]
  selectedIndex: number
}
```

## Actions

| Action | Payload | Effect |
|---|---|---|
| `setQueue` | `Track[]` | Replaces entire queue; resets `selectedIndex` to 0 |
| `setSelectedIndex` | `number` | Sets cursor; clamped to `[0, tracks.length - 1]`; 0 when queue is empty |
| `moveSelectionDown` | — | Increments cursor, clamped to last index |
| `moveSelectionUp` | — | Decrements cursor, clamped to 0 |
| `enqueueTrack` | `Track` | Appends track without moving cursor |
| `removeTrackRange` | `{ index, count }` | Removes `count` tracks from `index`; cursor decrements by how many removed tracks were before it; clamps to new last index; resets to 0 when queue empties |
| `clearQueue` | — | Empties queue and resets cursor to 0 |

## NORMAL Mode Keybinds

These keybinds are handled in `src/app/app-root/app-root.tsx` via a count-buffer + pending-key state machine (`keySeqRef: { count, pending }`).

| Keybind | Action |
|---|---|
| `[n]gg` | Jump to track `n` (default: first track, index 0) |
| `[n]G` | Jump to track `n` (default: last track) |
| `[n]dd` | Delete `n` tracks from cursor (default: 1) |
| `Enter` | Play selected track |
| `Ctrl+S` | Open playlist picker to save selected track to a playlist |
| `j` / `k` | Move cursor down / up (resets key sequence) |

## SEARCH Mode Keybinds

| Keybind | Action |
|---|---|
| `Ctrl+P` | Play selected search result |
| `Ctrl+A` | Enqueue selected result without leaving SEARCH mode |
| `Ctrl+S` | Open playlist picker to save selected search result to a playlist |

## Command

| Command | Effect |
|---|---|
| `:queue clear` | Empties the queue (command-mode equivalent of `dd` on all tracks) |

## Count Prefix State Machine

Digits typed before a command key accumulate in `keySeqRef.current.count`. Multi-key sequences (`gg`, `dd`) use `keySeqRef.current.pending`. Any unrecognized second key resets both. `j`/`k` also reset the sequence.

```
digit (1-9)            → append to count
0 (count non-empty)    → append to count
g (no shift)           → pending = "g"
G (shift+g)            → jump-to-last or jump-to-count; reset
pending="g", g pressed → jump-to-first or jump-to-count; reset
d                      → pending = "d"
pending="d", d pressed → removeTrackRange(cursor, count); reset
j / k                  → reset sequence, move cursor
```
