import type { LogEntry } from "../../features/logs/logs.slice.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type LogsPanelProps = {
  entries: LogEntry[]
  scrollOffset: number
  heightRows: number
  widthCols: number
  theme: ThemeTokens
}
