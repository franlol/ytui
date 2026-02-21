import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { Provider } from "react-redux"
import { AppRoot } from "../app-root/app-root"
import { setupDefaultCommands } from "../../features/commands/setup-default-commands/setup-default-commands"
import { playbackActions } from "../../features/playback/playback.slice"
import { pluginsActions } from "../../features/plugins/plugins.slice"
import { providerActions } from "../../features/provider/provider.slice"
import { queueActions } from "../../features/queue/queue.slice"
import { searchActions } from "../../features/search/search.slice"
import { settingsActions } from "../../features/settings/settings.slice"
import { uiActions } from "../../features/ui/ui.slice"
import { CommandRegistry } from "../../registries/commands/command.registry"
import { createDefaultProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import { createDefaultThemeRegistry } from "../../registries/themes/theme.registry"
import { FileConfigService } from "../../services/config/config.service"
import { DefaultProviderManager } from "../../services/providers/provider-manager/provider-manager"
import { YoutubeProvider } from "../../services/providers/youtube/youtube.provider"
import { loadPluginManifests } from "../../services/plugins/plugin-loader/plugin-loader"
import { YtDlpSearchService } from "../../services/search/search.service"
import { createAppStore } from "../../state/store/store"
import type { AppServices } from "../../state/store/store.types"
import type { ProviderInfo } from "../../types/app.types"
import type { AppRuntime } from "./create-app.types"

export async function createApp(): Promise<AppRuntime> {
  const configService = new FileConfigService()
  const commandRegistry = new CommandRegistry()
  const themeRegistry = createDefaultThemeRegistry()
  const progressStyleRegistry = createDefaultProgressStyleRegistry()
  const providerManager = new DefaultProviderManager()
  const searchService = new YtDlpSearchService()

  providerManager.register(new YoutubeProvider({ searchService }))

  const services: AppServices = {
    configService,
    providerManager,
    commandRegistry,
    themeRegistry,
    progressStyleRegistry,
  }

  const { store } = createAppStore(services)
  const config = await configService.load()

  store.dispatch(settingsActions.applyConfig(config))
  store.dispatch(uiActions.setSidebarCollapsed(config.sidebar === "off"))
  store.dispatch(uiActions.setMode(config.defaultMode))
  providerManager.setActive(config.providerDefault)
  store.dispatch(providerActions.setProviders(providerManager.list().map((provider) => provider.info)))
  store.dispatch(providerActions.setActiveProvider(providerManager.getActive()?.info.id ?? "youtube"))

  const loadedPlugins = await loadPluginManifests(config.plugins)
  store.dispatch(
    pluginsActions.setPlugins(
      loadedPlugins.map((plugin) => ({
        manifest: plugin.manifest,
        status: plugin.error ? "error" : plugin.enabled ? "loaded" : "disabled",
        error: plugin.error,
      })),
    ),
  )

  setupDefaultCommands(commandRegistry)

  const bootProvider = providerManager.getActive()
  const initialTracks = await bootProvider?.search?.search("", config.resultsLimit)
  store.dispatch(searchActions.searchSuccess(initialTracks ?? []))
  store.dispatch(queueActions.setQueue((initialTracks ?? []).slice(0, 3)))
  store.dispatch(playbackActions.setNowPlaying((initialTracks ?? [])[0] ?? null))

  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    useAlternateScreen: config.useAlternateScreen,
  })

  const root = createRoot(renderer as any)
  let started = false

  function destroy() {
    const current = store.getState()
    void configService.save({
      configVersion: 1,
      theme: current.settings.themeId,
      progressStyle: current.settings.progressStyleId,
      sidebar: current.ui.sidebarCollapsed ? "off" : "on",
      defaultMode: current.settings.defaultMode,
      resultsLimit: current.settings.resultsLimit,
      cavaEnabled: current.settings.cavaEnabled,
      cavaHeight: current.settings.cavaHeight,
      statusTimeoutMs: current.settings.statusTimeoutMs,
      useAlternateScreen: current.settings.useAlternateScreen,
      pluginsEnabled: true,
      plugins: [],
      providerDefault: current.provider.activeProviderId,
      providersEnabled: current.provider.available.map((provider: ProviderInfo) => provider.id),
    })

    if (started) {
      root.unmount()
    }

    renderer.destroy()
    process.exit(0)
  }

  function start() {
    if (started) {
      return
    }

    started = true
    root.render(
      <Provider store={store}>
        <AppRoot
          store={store}
          commandRegistry={commandRegistry}
          themeRegistry={themeRegistry}
          progressStyleRegistry={progressStyleRegistry}
          requestQuit={destroy}
        />
      </Provider>,
    )
  }

  return {
    start,
    destroy,
  }
}
