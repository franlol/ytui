import { describe, expect, it } from "bun:test"
import { YoutubeProvider } from "../youtube.provider"
import { StreamUrlCache } from "../../../stream-url-cache/stream-url-cache"
import type { PlaybackService } from "../../../playback/playback.service.types"
import type { Track } from "../../../../types/app.types"

// Never let tests shell out to real yt-dlp.
class StubStreamUrlCache extends StreamUrlCache {
  constructor(private readonly resolvedUrl: string | null = null) {
    super()
  }

  protected override fetchUrl(trackId: string): Promise<string> {
    if (this.resolvedUrl) {
      return Promise.resolve(this.resolvedUrl)
    }
    return Promise.reject(new Error(`stub cache has no URL for ${trackId}`))
  }
}

const track: Track = {
  id: "dQw4w9WgXcQ",
  title: "Demo",
  author: "Artist",
  durationSec: 180,
  durationLabel: "03:00",
  source: "youtube",
}

describe("youtube provider playback", () => {
  it("resolves a youtube watch URL when track id is a video id", async () => {
    let playedUrl = ""
    const playbackService: PlaybackService = {
      play: async (source) => {
        playedUrl = source.url
        return {
          id: "session-1",
          visualizerSource: "ytui_session.monitor",
          visualizerSourceMode: "ytui-strict",
          visualizerSourceVerified: true,
        }
      },
      pause: async () => {},
      resume: async () => {},
      seekTo: async () => {},
      getProgress: async () => ({ elapsedSec: 0, durationSec: 180, paused: false, available: true, volume: null }),
      stop: async () => {},
      getCurrentSession: () => ({
        id: "session-1",
        visualizerSource: "ytui_session.monitor",
        visualizerSourceMode: "ytui-strict",
        visualizerSourceVerified: true,
      }),
    }

    const provider = new YoutubeProvider({ playbackService, streamUrlCache: new StubStreamUrlCache() })
    await provider.playback?.play(track)

    expect(playedUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  })

  it("plays the resolved stream URL when the cache can provide one", async () => {
    let playedUrl = ""
    const playbackService: PlaybackService = {
      play: async (source) => {
        playedUrl = source.url
        return {
          id: "session-1",
          visualizerSource: "ytui_session.monitor",
          visualizerSourceMode: "ytui-strict",
          visualizerSourceVerified: true,
        }
      },
      pause: async () => {},
      resume: async () => {},
      seekTo: async () => {},
      getProgress: async () => ({ elapsedSec: 0, durationSec: 180, paused: false, available: true, volume: null }),
      stop: async () => {},
      getCurrentSession: () => null,
    }

    const provider = new YoutubeProvider({
      playbackService,
      streamUrlCache: new StubStreamUrlCache("https://streams.example/audio.m4a"),
    })
    await provider.playback?.play(track)

    expect(playedUrl).toBe("https://streams.example/audio.m4a")
  })
})
