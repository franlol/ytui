import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { Mode } from "../../types/app.types"

export type SidebarProps = {
  collapsed: boolean
  mode: Mode
  theme: ThemeTokens
}
