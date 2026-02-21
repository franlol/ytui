import type { CommandRegistry } from "../../registries/commands/command.registry"
import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeRegistry } from "../../registries/themes/theme.registry"
import type { VisualizerStyleRegistry } from "../../registries/visualizer-styles/visualizer-style.registry"
import type { AppStore } from "../../state/store/store"

export type AppRootProps = {
  store: AppStore
  commandRegistry: CommandRegistry
  themeRegistry: ThemeRegistry
  progressStyleRegistry: ProgressStyleRegistry
  visualizerStyleRegistry: VisualizerStyleRegistry
  requestQuit: () => void
}
