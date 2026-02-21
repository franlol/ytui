import type { RootState } from "../../state/store/store.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { VisualizerStyleRegistry } from "../../registries/visualizer-styles/visualizer-style.registry"

export type ZenLayoutProps = {
  state: RootState
  width: number
  height: number
  theme: ThemeTokens
  visualizerStyleRegistry: VisualizerStyleRegistry
}
