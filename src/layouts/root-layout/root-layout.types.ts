import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeRegistry } from "../../registries/themes/theme.registry"
import type { VisualizerStyleRegistry } from "../../registries/visualizer-styles/visualizer-style.registry"
import type { RootState } from "../../state/store/store.types"

export type RootLayoutProps = {
  state: RootState
  width: number
  height: number
  themeRegistry: ThemeRegistry
  progressStyleRegistry: ProgressStyleRegistry
  visualizerStyleRegistry: VisualizerStyleRegistry
}
