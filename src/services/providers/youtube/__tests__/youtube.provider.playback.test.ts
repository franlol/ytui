import { describe, expect, it } from "bun:test"
import { YoutubeProvider } from "../youtube.provider"
import type { PlaybackService } from "../../../playback/playback.service.types"
import type { Track } from "../../../../types/app.types"

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
      getProgress: async () => ({ elapsedSec: 0, durationSec: 180, paused: false, available: true }),
      stop: async () => {},
      getCurrentSession: () => ({
        id: "session-1",
        visualizerSource: "ytui_session.monitor",
        visualizerSourceMode: "ytui-strict",
        visualizerSourceVerified: true,
      }),
    }

    const provider = new YoutubeProvider({ playbackService })
    await provider.playback?.play(track)

    expect(playedUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  })
})
