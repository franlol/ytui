import type { ThemeDefinition } from "../../../registries/themes/theme.registry.types"

export type ThemeLoadResult = {
  definition?: ThemeDefinition
  filename: string
  error?: string
}
