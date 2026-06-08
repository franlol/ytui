import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type SettingsRowDisplay = {
  name: string
  description: string
  disabled?: boolean
}

export type SettingsPanelProps = {
  categoryIndex: number
  itemIndex: number
  items: SettingsRowDisplay[]
  heightRows: number
  widthCols: number
  theme: ThemeTokens
}
