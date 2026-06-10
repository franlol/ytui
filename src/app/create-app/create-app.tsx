import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { Provider } from "react-redux"
import { AppRoot } from "../app-root/app-root"
import { setupDefaultCommands } from "../../features/commands/setup-default-commands/setup-default-commands"
import { loadLibraryThunk } from "../../features/library/library.thunks"
import { pluginsActions } from "../../features/plugins/plugins.slice"
import { providerActions } from "../../features/provider/provider.slice"
import { settingsActions } from "../../features/settings/settings.slice"
import { saveConfigThunk } from "../../features/settings/settings.thunks"
import { uiActions } from "../../features/ui/ui.slice"
import { CommandRegistry } from "../../registries/commands/command.registry"
import { createDefaultProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import { createDefaultThemeRegistry } from "../../registries/themes/theme.registry"
import { createDefaultVisualizerStyleRegistry } from "../../registries/visualizer-styles/visualizer-style.registry"
import { FileConfigService } from "../../services/config/config.service"
import { FileLibraryService } from "../../services/library/library.service"
import { DefaultProviderManager } from "../../services/providers/provider-manager/provider-manager"
import { YoutubeProvider } from "../../services/providers/youtube/youtube.provider"
import { loadPluginManifests } from "../../services/plugins/plugin-loader/plugin-loader"
import { loadUserThemes } from "../../services/themes/theme-loader/theme-loader"
import { YtDlpSearchService } from "../../services/search/search.service"
import { Logger } from "../../services/logger/logger"
import { CavaVisualizerService } from "../../services/visualizer/cava-visualizer.service"
import { createAppStore } from "../../state/store/store"
import type { AppServices } from "../../state/store/store.types"
import type { AppRuntime } from "./create-app.types"

export async function createApp(): Promise<AppRuntime> {
  const configService = new FileConfigService()
  const libraryService = new FileLibraryService()
  const commandRegistry = new CommandRegistry()
  const themeRegistry = createDefaultThemeRegistry()
  const progressStyleRegistry = createDefaultProgressStyleRegistry()
  const visualizerStyleRegistry = createDefaultVisualizerStyleRegistry()
  const providerManager = new DefaultProviderManager()
  const searchService = new YtDlpSearchService()
  const visualizerService = new CavaVisualizerService()

  providerManager.register(new YoutubeProvider({ searchService }))

  const services: AppServices = {
    configService,
    libraryService,
    providerManager,
    visualizerService,
    commandRegistry,
    themeRegistry,
    progressStyleRegistry,
    visualizerStyleRegistry,
  }

  const { store } = createAppStore(services)
  const config = await configService.load()

  store.dispatch(settingsActions.applyConfig(config))
  store.dispatch(uiActions.setSidebarCollapsed(config.sidebar === "off"))
  store.dispatch(uiActions.setMode(config.defaultMode))
  void store.dispatch(loadLibraryThunk())
  providerManager.setActive(config.providerDefault)
  store.dispatch(providerActions.setProviders(providerManager.list().map((provider) => provider.info)))
  store.dispatch(providerActions.setActiveProvider(providerManager.getActive()?.info.id ?? "youtube"))

  store.dispatch(pluginsActions.setPluginConfig({ pluginsEnabled: config.pluginsEnabled, configuredIds: config.plugins }))

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

  const userThemes = await loadUserThemes(new Set(themeRegistry.list().map((t) => t.id)))
  for (const result of userThemes) {
    if (result.definition) {
      themeRegistry.register(result.definition)
    }
  }

  const logger = new Logger(store.dispatch)

  logger.info("config", `loaded — theme=${config.theme} provider=${config.providerDefault}`)

  const activeProvider = providerManager.getActive()
  logger.info("provider", `active: ${activeProvider?.info.id ?? "none"}`)

  for (const plugin of loadedPlugins) {
    if (plugin.error) {
      logger.error(`plugin:${plugin.manifest.id}`, plugin.error)
    } else if (plugin.enabled) {
      logger.info(`plugin:${plugin.manifest.id}`, `loaded v${plugin.manifest.version}`)
    } else {
      logger.debug(`plugin:${plugin.manifest.id}`, "disabled")
    }
  }

  setupDefaultCommands(commandRegistry)

  logger.info("app", "started")

  // Ctrl+C is routed through the app's keyboard handler (and the signal
  // handlers below) so quitting always runs this full cleanup; opentui's
  // built-in exit would only restore the terminal and leave mpv/cava running.
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    useMouse: true,
  })

  const root = createRoot(renderer as any)
  let started = false
  let destroying = false

  async function destroy() {
    if (destroying) {
      return
    }
    destroying = true

    await store.dispatch(saveConfigThunk())

    await Promise.allSettled([
      libraryService.save(store.getState().library.playlists),
      providerManager.getActive()?.playback?.stop(),
      visualizerService.stop(),
    ])

    if (started) {
      root.unmount()
    }

    renderer.destroy()
    process.exit(0)
  }

  process.once("SIGINT", () => void destroy())
  process.once("SIGTERM", () => void destroy())

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
          visualizerStyleRegistry={visualizerStyleRegistry}
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
