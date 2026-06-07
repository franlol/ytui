import type { ThemeDefinition } from "../../registries/themes/theme.registry.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type ThemePickerProps = {
  themes: ThemeDefinition[]
  selectedIndex: number
  theme: ThemeTokens
  screenWidth: number
  screenHeight: number
}
