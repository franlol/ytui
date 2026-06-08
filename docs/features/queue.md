# Queue Slice

Manages the list of tracks queued for playback, the cursor position, the currently playing position, and playback mode flags.

**File:** `src/features/queue/queue.slice.ts`  
**State type:** `src/features/queue/queue.types.ts`

## State Shape

```typescript
type RepeatMode = "none" | "one" | "all"

type QueueState = {
  tracks: Track[]
  selectedIndex: number    // UI cursor — independent of playingIndex
  playingIndex: number | null  // index of the track currently playing; null when nothing is playing from queue
  repeatMode: RepeatMode
  shuffleEnabled: boolean
}
```

### `selectedIndex` vs `playingIndex`

`selectedIndex` is the UI cursor used for navigation (`j`/`k`, `gg`, `G`, `dd`). It does not affect which track plays next.

`playingIndex` tracks which queue entry is currently playing. It is set when the user presses Enter on a queue item or when auto-advance moves to the next track. The diamond marker (◆) in the queue list uses `playingIndex`, not track ID matching, so duplicate entries are handled correctly.

## Actions

| Action | Payload | Effect |
|---|---|---|
| `setQueue` | `Track[]` | Replaces entire queue; resets `selectedIndex` to 0 and `playingIndex` to null |
| `setSelectedIndex` | `number` | Sets cursor; clamped to `[0, tracks.length - 1]`; 0 when queue is empty |
| `moveSelectionDown` | — | Increments cursor, clamped to last index |
| `moveSelectionUp` | — | Decrements cursor, clamped to 0 |
| `enqueueTrack` | `Track` | Appends track without moving cursor or playingIndex |
| `removeTrackRange` | `{ index, count }` | Removes `count` tracks from `index`; adjusts both `selectedIndex` and `playingIndex` by the number of removed entries that preceded each; clears `playingIndex` if the playing track itself is removed; resets to 0 / null when queue empties |
| `clearQueue` | — | Empties queue; resets `selectedIndex` to 0 and `playingIndex` to null |
| `setPlayingIndex` | `number \| null` | Sets playingIndex; clamped to valid range; null when queue is empty |
| `setRepeatMode` | `RepeatMode` | Sets repeat mode directly |
| `cycleRepeatMode` | — | Cycles `none → one → all → none` |
| `setShuffleEnabled` | `boolean` | Sets shuffle on or off directly |
| `toggleShuffle` | — | Flips `shuffleEnabled` |

## Playback Thunks

Defined in `src/features/playback/playback.thunks.ts`.

### `runPlayNextInQueueThunk`

Advances playback to the next track. Logic:
- `repeatMode = "one"`: replays `playingIndex`.
- `shuffleEnabled`: picks a random index.
- Otherwise: increments `playingIndex`. If past end, wraps to 0 when `repeatMode = "all"`, otherwise sets `playingIndex = null` (end of queue).

Dispatches `setPlayingIndex`, `setSelectedIndex` (cursor follows playing track), and `runPlayTrackThunk`.

Also called automatically by `runSyncPlaybackProgressThunk` when a track ends (3 consecutive sync misses while `playing = true`).

### `runPlayPreviousInQueueThunk`

Goes to the previous track. Logic mirrors `runPlayNextInQueueThunk` in reverse. Shows `"INFO: already at first track"` when at the start with `repeatMode ≠ "all"`.

## NORMAL Mode Keybinds

These keybinds are handled in `src/app/app-root/app-root.tsx` via a count-buffer + pending-key state machine (`keySeqRef: { count, pending }`).

| Keybind | Action |
|---|---|
| `[n]gg` | Jump to track `n` (default: first track, index 0) |
| `[n]G` | Jump to track `n` (default: last track) |
| `[n]dd` | Delete `n` tracks from cursor (default: 1) |
| `Enter` / `Ctrl+P` | Play selected track; sets `playingIndex` to `selectedIndex` |
| `]` | Skip to next track (`runPlayNextInQueueThunk`) |
| `[` | Skip to previous track (`runPlayPreviousInQueueThunk`) |
| `Ctrl+S` | Open playlist picker to save selected track to a playlist |
| `j` / `k` | Move cursor down / up (resets key sequence) |

## SEARCH Mode Keybinds

| Keybind | Action |
|---|---|
| `Ctrl+P` | Play selected search result |
| `Ctrl+A` | Enqueue selected result without leaving SEARCH mode |
| `Ctrl+S` | Open playlist picker to save selected search result to a playlist |

## Commands

| Command | Effect |
|---|---|
| `:queue clear` | Empties the queue |
| `:queue next` | Skip to next track |
| `:queue prev` | Skip to previous track |
| `:queue shuffle on\|off\|toggle` | Toggle shuffle mode |
| `:queue repeat none\|one\|all` | Set repeat mode |

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
