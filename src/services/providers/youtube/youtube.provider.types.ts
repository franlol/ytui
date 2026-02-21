import type { Track } from "../../../types/app.types"
import type { PlaybackService } from "../../playback/playback.service.types"
import type { SearchService } from "../../search/search.service.types"

export type YoutubeProviderCatalog = {
  tracks?: Track[]
  searchService?: SearchService
  playbackService?: PlaybackService
}
