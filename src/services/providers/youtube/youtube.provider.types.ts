import type { Track } from "../../../types/app.types"
import type { PlaybackService } from "../../playback/playback.service.types"
import type { SearchService } from "../../search/search.service.types"
import type { StreamUrlCache } from "../../stream-url-cache/stream-url-cache"

export type YoutubeProviderCatalog = {
  tracks?: Track[]
  searchService?: SearchService
  playbackService?: PlaybackService
  streamUrlCache?: StreamUrlCache
}
