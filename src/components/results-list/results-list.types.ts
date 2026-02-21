import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { Track } from "../../types/app.types"

export type ResultsListProps = {
  totalCount: number
  theme: ThemeTokens
  heightRows: number
  widthCols: number
  tracks: Track[]
  selectedIndex: number
}
