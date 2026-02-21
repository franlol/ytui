import type { AppDispatch, RootState } from "../../state/store/store.types"
import type { ProgressStyleRegistry } from "../progress-styles/progress-style.registry"
import type { ThemeRegistry } from "../themes/theme.registry"
import type { VisualizerStyleRegistry } from "../visualizer-styles/visualizer-style.registry"

export type CommandExecutionContext = {
  dispatch: AppDispatch
  getState: () => RootState
  themeRegistry: ThemeRegistry
  progressStyleRegistry: ProgressStyleRegistry
  visualizerStyleRegistry: VisualizerStyleRegistry
  requestQuit: () => void
}

export type CommandDefinition = {
  name: string
  description: string
  aliases?: string[]
  execute: (args: string[], context: CommandExecutionContext) => void
}
