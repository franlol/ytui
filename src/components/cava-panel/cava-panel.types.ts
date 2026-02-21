import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type CavaPanelProps = {
  bars: number[]
  ramp: string[]
  width: number
  lines: number
  fill?: boolean
  theme: ThemeTokens
}
