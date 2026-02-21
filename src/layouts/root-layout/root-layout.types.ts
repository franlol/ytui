import type { SelectRenderable } from "@opentui/core"
import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeRegistry } from "../../registries/themes/theme.registry"
import type { RootState } from "../../state/store/store.types"

export type RootLayoutProps = {
  state: RootState
  width: number
  height: number
  themeRegistry: ThemeRegistry
  progressStyleRegistry: ProgressStyleRegistry
  resultsSelect: SelectRenderable
  queueSelect: SelectRenderable
}
