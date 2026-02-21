import type { Track } from "../../../types/app.types"
import { PlaybackServiceError, MpvPlaybackService } from "../../playback/playback.service"
import type { PlaybackService } from "../../playback/playback.service.types"
import { YtDlpSearchService } from "../../search/search.service"
import type { SearchService } from "../../search/search.service.types"
import type { MusicProvider } from "../provider.types"
import type { YoutubeProviderCatalog } from "./youtube.provider.types"

const defaultCatalog: Track[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "Nujabes - Feather (Official Audio Remaster 2024 Extended Edition)",
    author: "Hydeout Productions",
    durationSec: 253,
    durationLabel: "04:13",
    source: "youtube",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "J Dilla - So Far To Go (feat. Common and D'Angelo)",
    author: "Stones Throw",
    durationSec: 225,
    durationLabel: "03:45",
    source: "youtube",
  },
  {
    id: "kXYiU_JCYtU",
    title: "Tomppabeats - monday loop",
    author: "Chillhop",
    durationSec: 176,
    durationLabel: "02:56",
    source: "youtube",
  },
  {
    id: "09R8_2nJtjg",
    title: "uyama hiroto - Waltz for Life Will Born",
    author: "Hydeout Productions",
    durationSec: 280,
    durationLabel: "04:40",
    source: "youtube",
  },
  {
    id: "e-ORhEE9VVg",
    title: "idealism - snowfall",
    author: "Lost in Dreams",
    durationSec: 182,
    durationLabel: "03:02",
    source: "youtube",
  },
  {
    id: "3JZ_D3ELwOQ",
    title: "Eevee - forest walk",
    author: "Chillhop",
    durationSec: 201,
    durationLabel: "03:21",
    source: "youtube",
  },
  {
    id: "YQHsXMglC9A",
    title: "saib - west lake",
    author: "Chillhop",
    durationSec: 169,
    durationLabel: "02:49",
    source: "youtube",
  },
]

export class YoutubeProvider implements MusicProvider {
  readonly info = {
    id: "youtube",
    name: "YouTube Music",
    description: "MVP provider with search + playback",
    capabilities: {
      search: true,
      playback: true,
      auth: false,
      library: false,
    },
  }

  private catalog: Track[]
  private searchService: SearchService
  private playbackService: PlaybackService

  constructor(options?: YoutubeProviderCatalog) {
    this.catalog = options?.tracks ?? defaultCatalog
    this.searchService = options?.searchService ?? new YtDlpSearchService()
    this.playbackService = options?.playbackService ?? new MpvPlaybackService()
  }

  search = {
    search: async (query: string, limit: number): Promise<Track[]> => {
      const normalized = query.trim()
      const safeLimit = Math.max(1, Math.min(100, limit))

      if (!normalized) {
        return this.catalog.slice(0, safeLimit)
      }

      try {
        const results = await this.searchService.search(normalized, safeLimit)
        if (results.length === 0) {
          return []
        }

        return results.map((result) => ({
          id: result.id,
          title: result.title,
          author: result.author,
          durationSec: result.durationSec,
          durationLabel: result.durationLabel,
          source: "youtube",
        }))
      } catch {
        const fallback = this.catalog.filter((track) => `${track.title} ${track.author}`.toLowerCase().includes(normalized.toLowerCase()))
        return fallback.slice(0, safeLimit)
      }
    },
  }

  playback = {
    play: async (track: Track) => {
      const sourceUrl = resolveYoutubeTrackUrl(track)
      await this.playbackService.play({ url: sourceUrl })
    },
    pause: async () => {
      await this.playbackService.pause()
    },
    resume: async () => {
      await this.playbackService.resume()
    },
    stop: async () => {
      await this.playbackService.stop()
    },
  }
}

function resolveYoutubeTrackUrl(track: Track): string {
  if (track.source !== "youtube") {
    throw new PlaybackServiceError(`unsupported track source: ${track.source}`)
  }

  if (!track.id) {
    throw new PlaybackServiceError("missing YouTube track id")
  }

  if (track.id.startsWith("http://") || track.id.startsWith("https://")) {
    return track.id
  }

  return `https://www.youtube.com/watch?v=${track.id}`
}
