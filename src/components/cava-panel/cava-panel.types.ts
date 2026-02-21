import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type CavaPanelProps = {
  phase: number
  width: number
  lines: number
  fill?: boolean
  theme: ThemeTokens
}
