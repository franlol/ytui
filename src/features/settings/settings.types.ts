import type { Mode } from "../../types/app.types"

export type SettingsState = {
  themeId: string
  progressStyleId: string
  cavaStyleId: string
  resultsLimit: number
  cavaEnabled: boolean
  cavaHeight: number
  statusTimeoutMs: number
  useAlternateScreen: boolean
  defaultMode: Mode
}
