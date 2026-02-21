import type { Track } from "../../../types/app.types"
import { YtDlpSearchService } from "../../search/search.service"
import type { SearchService } from "../../search/search.service.types"
import type { MusicProvider } from "../provider.types"
import type { YoutubeProviderCatalog } from "./youtube.provider.types"

const defaultCatalog: Track[] = [
  {
    id: "yt-1",
    title: "Nujabes - Feather (Official Audio Remaster 2024 Extended Edition)",
    author: "Hydeout Productions",
    durationSec: 253,
    durationLabel: "04:13",
    source: "youtube",
  },
  {
    id: "yt-2",
    title: "J Dilla - So Far To Go (feat. Common and D'Angelo)",
    author: "Stones Throw",
    durationSec: 225,
    durationLabel: "03:45",
    source: "youtube",
  },
  {
    id: "yt-3",
    title: "Tomppabeats - monday loop",
    author: "Chillhop",
    durationSec: 176,
    durationLabel: "02:56",
    source: "youtube",
  },
  {
    id: "yt-4",
    title: "uyama hiroto - Waltz for Life Will Born",
    author: "Hydeout Productions",
    durationSec: 280,
    durationLabel: "04:40",
    source: "youtube",
  },
  {
    id: "yt-5",
    title: "idealism - snowfall",
    author: "Lost in Dreams",
    durationSec: 182,
    durationLabel: "03:02",
    source: "youtube",
  },
  {
    id: "yt-6",
    title: "Eevee - forest walk",
    author: "Chillhop",
    durationSec: 201,
    durationLabel: "03:21",
    source: "youtube",
  },
  {
    id: "yt-7",
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

  constructor(options?: YoutubeProviderCatalog) {
    this.catalog = options?.tracks ?? defaultCatalog
    this.searchService = options?.searchService ?? new YtDlpSearchService()
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
    play: async (_track: Track) => {},
    pause: async () => {},
    resume: async () => {},
    stop: async () => {},
  }
}
