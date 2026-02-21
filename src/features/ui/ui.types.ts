import type { Mode, StatusLevel } from "../../types/app.types"

export type UiState = {
  mode: Mode
  sidebarCollapsed: boolean
  commandActive: boolean
  commandBuffer: string
  helpOpen: boolean
  statusMessage: string | null
  statusLevel: StatusLevel | null
}
