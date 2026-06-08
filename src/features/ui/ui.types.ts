import type { Mode, StatusLevel } from "../../types/app.types"

export type UiState = {
  mode: Mode
  sidebarCollapsed: boolean
  commandActive: boolean
  commandBuffer: string
  helpOpen: boolean
  themePickerOpen: boolean
  themePickerSelectedIndex: number
  themePickerPreviousId: string
  playlistPickerOpen: boolean
  playlistPickerSelectedIndex: number
  statusMessage: string | null
  statusLevel: StatusLevel | null
  settingsCategoryIndex: number
  settingsItemIndex: number
}
