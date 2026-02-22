import type { Mode, StatusLevel } from "../../types/app.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type StatuslineProps = {
  mode: Mode
  commandActive: boolean
  commandBuffer: string
  statusMessage: string | null
  statusLevel: StatusLevel | null
  queueLength: number
  volume: number
  sidebarCollapsed: boolean
  width: number
  theme: ThemeTokens
}
