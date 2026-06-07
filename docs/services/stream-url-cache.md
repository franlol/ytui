# StreamUrlCache

`src/services/stream-url-cache/stream-url-cache.ts`

Resolves and caches direct audio stream URLs for YouTube track IDs using `yt-dlp`.

## Purpose

Decouples stream URL resolution from playback initiation so that URLs can be pre-fetched while the user browses results. This removes the `yt-dlp` latency from the hot path on the first play of a freshly searched track.

## Contract

| Method | Behavior |
|---|---|
| `get(trackId)` | Returns cached URL or `null` if missing/expired |
| `resolve(trackId)` | Returns cached URL or fetches via `yt-dlp`; deduplicates in-flight requests |
| `prefetch(trackIds[])` | Enqueues IDs for background resolution; capped at 3 concurrent fetches |
| `evict(trackId)` | Removes entry and any in-flight promise; called on playback failure |

## Key Constraints

- **TTL:** 4 hours. YouTube stream URLs expire; entries older than 4h are evicted on next read.
- **Concurrency cap:** Maximum 3 concurrent `yt-dlp` processes via internal queue/drain loop.
- **Failure isolation:** `prefetch` failures are silent. `resolve` failures propagate to callers. On playback failure the provider evicts the entry and falls back to a direct watch URL.
- **No global state:** `StreamUrlCache` is instantiated per-provider; injectable via `YoutubeProviderCatalog` for testing.

## Integration Points

- `YoutubeProvider` owns the instance and calls `prefetch` after every search result batch.
- `YoutubeProvider.playback.play` calls `get` then `resolve`; on failure it evicts and falls back.
- `YoutubeProviderCatalog` exposes `streamUrlCache?: StreamUrlCache` for test injection.

## Optimistic Playback Flow

`runPlayTrackThunk` now sets `nowPlaying` **before** awaiting `provider.playback.play`. If play fails, `nowPlaying` is reset to `null`. This gives the UI an immediate track title/metadata display while the audio route initializes in parallel with any remaining stream URL resolution.

Parallel audio init: `MpvPlaybackService.play` now runs `this.stop()` and `createAudioRoute()` concurrently via `Promise.all`, reducing the serial setup delay.
