import { Box, SelectRenderable, SelectRenderableEvents, createCliRenderer, type KeyEvent } from "@opentui/core"
import { parseCommandInput } from "../../features/commands/command-parser/command-parser"
import { setupDefaultCommands } from "../../features/commands/setup-default-commands/setup-default-commands"
import { playbackActions } from "../../features/playback/playback.slice"
import { pluginsActions } from "../../features/plugins/plugins.slice"
import { providerActions } from "../../features/provider/provider.slice"
import { queueActions } from "../../features/queue/queue.slice"
import { searchActions } from "../../features/search/search.slice"
import { runSearchThunk } from "../../features/search/search.thunks"
import { settingsActions } from "../../features/settings/settings.slice"
import { uiActions } from "../../features/ui/ui.slice"
import { visualizerActions } from "../../features/visualizer/visualizer.slice"
import { RootLayout } from "../../layouts/root-layout/root-layout"
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

  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    useAlternateScreen: config.useAlternateScreen,
  })

  const resultsSelect = new SelectRenderable(renderer, {
    id: "results-select",
    width: 20,
    height: 5,
    options: [],
    showDescription: true,
    showScrollIndicator: true,
    itemSpacing: 0,
    wrapSelection: false,
  })

  const queueSelect = new SelectRenderable(renderer, {
    id: "queue-select",
    width: 20,
    height: 5,
    options: [],
    showDescription: true,
    showScrollIndicator: true,
    itemSpacing: 0,
    wrapSelection: false,
  })

  let syncingSelectState = false

  resultsSelect.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number) => {
    if (syncingSelectState) {
      return
    }
    store.dispatch(searchActions.setSelectedIndex(index))
  })

  queueSelect.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number) => {
    if (syncingSelectState) {
      return
    }
    store.dispatch(queueActions.setSelectedIndex(index))
  })

  const bootProvider = providerManager.getActive()
  const initialTracks = await bootProvider?.search?.search("", config.resultsLimit)
  store.dispatch(searchActions.searchSuccess(initialTracks ?? []))
  store.dispatch(queueActions.setQueue((initialTracks ?? []).slice(0, 3)))
  store.dispatch(playbackActions.setNowPlaying((initialTracks ?? [])[0] ?? null))

  const frameTimer = setInterval(() => {
    store.dispatch(playbackActions.tick())
    store.dispatch(visualizerActions.tickPhase())
  }, 1000)

  let statusTimer: NodeJS.Timeout | null = null

  const unsubscribe = store.subscribe(() => {
    syncSelectRenderables()
    render()
  })

  function syncSelectRenderables() {
    const state = store.getState()
    const theme = themeRegistry.getTokens(state.settings.themeId)

    const contentWidth = Math.max(24, renderer.width - (state.ui.sidebarCollapsed ? 8 : 30))
    const isSearch = state.ui.mode === "search"
    const topbarRows = 1
    const statuslineRows = 1
    const outerPaddingRows = 2
    const gapRows = isSearch ? 3 : 2
    const searchRows = isSearch ? 4 : 0
    const nowPlayingRows = 5
    const cavaRows = Math.max(3, state.settings.cavaHeight + 2)
    const fixedRows = topbarRows + statuslineRows + outerPaddingRows + gapRows + searchRows + nowPlayingRows + cavaRows
    const listHeightRows = Math.max(0, renderer.height - fixedRows)
    const panelHeight = Math.max(3, listHeightRows)
    const listHeight = Math.max(1, panelHeight - 2)
    const listWidth = Math.max(10, contentWidth - 4)

    resultsSelect.width = listWidth
    resultsSelect.height = listHeight
    resultsSelect.options = state.search.results.map((track) => ({
      name: track.title,
      description: `${track.author}  ${track.durationLabel}`,
      value: track.id,
    }))
    resultsSelect.backgroundColor = theme.panel
    resultsSelect.textColor = theme.text
    resultsSelect.selectedBackgroundColor = theme.selectedBg
    resultsSelect.selectedTextColor = theme.accent
    resultsSelect.descriptionColor = theme.muted
    resultsSelect.selectedDescriptionColor = theme.text

    queueSelect.width = listWidth
    queueSelect.height = listHeight
    queueSelect.options = state.queue.tracks.map((track) => ({
      name: track.title,
      description: `${track.author}  ${track.durationLabel}`,
      value: track.id,
    }))
    queueSelect.backgroundColor = theme.panel
    queueSelect.textColor = theme.text
    queueSelect.selectedBackgroundColor = theme.selectedBg
    queueSelect.selectedTextColor = theme.accent
    queueSelect.descriptionColor = theme.muted
    queueSelect.selectedDescriptionColor = theme.text

    syncingSelectState = true
    if (state.search.results.length > 0) {
      resultsSelect.setSelectedIndex(Math.max(0, Math.min(state.search.selectedIndex, state.search.results.length - 1)))
    }
    if (state.queue.tracks.length > 0) {
      queueSelect.setSelectedIndex(Math.max(0, Math.min(state.queue.selectedIndex, state.queue.tracks.length - 1)))
    }
    syncingSelectState = false

  }

  function setStatusWithTimeout(message: string, level: "ok" | "err" | "info" = "info") {
    if (statusTimer) {
      clearTimeout(statusTimer)
    }

    store.dispatch(uiActions.setStatus({ message, level }))
    statusTimer = setTimeout(() => {
      store.dispatch(uiActions.clearStatus())
      render()
    }, store.getState().settings.statusTimeoutMs)
  }

  function executeCommand(input: string) {
    const parsed = parseCommandInput(input)
    if (!parsed) {
      return
    }

    const command = commandRegistry.resolve(parsed.name)
    if (!command) {
      setStatusWithTimeout(`ERR: unknown command :${parsed.name}`, "err")
      return
    }

    command.execute(parsed.args, {
      dispatch: store.dispatch,
      getState: store.getState,
      themeRegistry,
      progressStyleRegistry,
      requestQuit: () => {
        destroy()
      },
    })
  }

  ;(renderer.keyInput as any).on("keypress", (key: KeyEvent) => {
    handleKey(key)
  })

  renderer.on("resize", () => {
    syncSelectRenderables()
    render()
  })

  function isPrintable(sequence: string): boolean {
    if (!sequence || sequence.length !== 1) {
      return false
    }
    const code = sequence.charCodeAt(0)
    return code >= 32 && code <= 126
  }

  function handleKey(key: KeyEvent) {
    const state = store.getState()

    if (state.ui.helpOpen) {
      if (key.name === "escape" || key.name === "q" || key.name === "return") {
        store.dispatch(uiActions.setHelpOpen(false))
      }
      return
    }

    if (state.ui.commandActive) {
      if (key.name === "escape") {
        store.dispatch(uiActions.setCommandActive(false))
        store.dispatch(uiActions.setCommandBuffer(""))
        return
      }

      if (key.name === "return") {
        executeCommand(state.ui.commandBuffer)
        store.dispatch(uiActions.setCommandBuffer(""))
        store.dispatch(uiActions.setCommandActive(false))
        return
      }

      if (key.name === "backspace") {
        store.dispatch(uiActions.setCommandBuffer(state.ui.commandBuffer.slice(0, -1)))
        return
      }

      if (key.sequence && isPrintable(key.sequence)) {
        store.dispatch(uiActions.setCommandBuffer(`${state.ui.commandBuffer}${key.sequence}`))
      }
      return
    }

    if (key.name === "tab") {
      store.dispatch(uiActions.cycleMode())
      return
    }

    if (key.name === "escape") {
      store.dispatch(uiActions.setMode("normal"))
      return
    }

    if (key.name === "space") {
      store.dispatch(playbackActions.togglePlaying())
      setStatusWithTimeout(`OK: ${store.getState().playback.playing ? "playing" : "paused"}`, "ok")
      return
    }

    if (key.name === "colon" || key.sequence === ":") {
      store.dispatch(uiActions.clearStatus())
      store.dispatch(uiActions.setCommandActive(true))
      store.dispatch(uiActions.setCommandBuffer(""))
      return
    }

    if (state.ui.mode === "search") {
      if (key.name === "return") {
        store.dispatch(runSearchThunk())
        return
      }

      if (key.name === "backspace") {
        store.dispatch(searchActions.setQuery(state.search.query.slice(0, -1)))
        return
      }

      if (key.name === "j" || key.name === "down") {
        resultsSelect.moveDown()
        return
      }

      if (key.name === "k" || key.name === "up") {
        resultsSelect.moveUp()
        return
      }

      if (key.sequence && isPrintable(key.sequence)) {
        store.dispatch(searchActions.setQuery(`${state.search.query}${key.sequence}`))
      }
      return
    }

    if (state.ui.mode === "normal") {
      if (key.name === "j" || key.name === "down") {
        queueSelect.moveDown()
        return
      }

      if (key.name === "k" || key.name === "up") {
        queueSelect.moveUp()
      }
    }
  }

  function render() {
    try {
      renderer.root.remove("screen")
    } catch {
      // no-op
    }

    try {
      renderer.root.remove("help-modal")
    } catch {
      // no-op
    }

    const node = RootLayout({
      state: store.getState(),
      width: renderer.width,
      height: renderer.height,
      themeRegistry,
      progressStyleRegistry,
      resultsSelect,
      queueSelect,
    })

    renderer.root.add(node)
  }

  function destroy() {
    if (statusTimer) {
      clearTimeout(statusTimer)
      statusTimer = null
    }
    clearInterval(frameTimer)
    unsubscribe()

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
      providersEnabled: current.provider.available.map((provider) => provider.id),
    })

    renderer.destroy()
    process.exit(0)
  }

  syncSelectRenderables()
  render()

  return {
    start: render,
    destroy,
  }
}
