import type { Mode } from "../../types/app.types"

export type SettingsState = {
  themeId: string
  progressStyleId: string
  cavaStyleId: string
  cavaSourceMode: "ytui-strict" | "ytui-best-effort" | "system"
  resultsLimit: number
  cavaEnabled: boolean
  cavaHeight: number
  statusTimeoutMs: number
  useAlternateScreen: boolean
  defaultMode: Mode
}
