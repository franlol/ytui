import type { RootState } from "../../state/store/store.types"
import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { VisualizerStyleRegistry } from "../../registries/visualizer-styles/visualizer-style.registry"

export type MainLayoutProps = {
  state: RootState
  width: number
  height: number
  theme: ThemeTokens
  progressStyleRegistry: ProgressStyleRegistry
  visualizerStyleRegistry: VisualizerStyleRegistry
}
