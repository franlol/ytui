import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { Track } from "../../types/app.types"

export type QueueListProps = {
  totalCount: number
  theme: ThemeTokens
  heightRows: number
  widthCols: number
  tracks: Track[]
  selectedIndex: number
  nowPlayingTrackId?: string
  runtimeDurationSec?: number
}
