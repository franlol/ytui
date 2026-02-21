import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import type { PlaybackState } from "../../features/playback/playback.types"
import type { PluginsState } from "../../features/plugins/plugins.types"
import type { ProviderState } from "../../features/provider/provider.types"
import type { QueueState } from "../../features/queue/queue.types"
import type { SearchState } from "../../features/search/search.types"
import type { SettingsState } from "../../features/settings/settings.types"
import type { UiState } from "../../features/ui/ui.types"
import type { VisualizerState } from "../../features/visualizer/visualizer.types"
import type { CommandRegistry } from "../../registries/commands/command.registry"
import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeRegistry } from "../../registries/themes/theme.registry"
import type { ConfigService } from "../../services/config/config.service.types"
import type { ProviderManager } from "../../services/providers/provider-manager/provider-manager.types"

export type RootState = {
  ui: UiState
  search: SearchState
  queue: QueueState
  playback: PlaybackState
  visualizer: VisualizerState
  settings: SettingsState
  provider: ProviderState
  plugins: PluginsState
  [key: string]: unknown
}

export type AppServices = {
  configService: ConfigService
  providerManager: ProviderManager
  commandRegistry: CommandRegistry
  themeRegistry: ThemeRegistry
  progressStyleRegistry: ProgressStyleRegistry
}

export type AppDispatch = ThunkDispatch<RootState, AppServices, UnknownAction>
