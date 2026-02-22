import { providerActions } from "../../provider/provider.slice"
import { searchActions } from "../../search/search.slice"
import { settingsActions } from "../../settings/settings.slice"
import { uiActions } from "../../ui/ui.slice"
import type { CommandRegistry } from "../../../registries/commands/command.registry"

export function setupDefaultCommands(commandRegistry: CommandRegistry) {
  const cavaSourceModes = ["ytui-strict", "ytui-best-effort", "system"] as const

  commandRegistry.register({
    name: "q",
    description: "Quit application",
    execute: (_args, context) => {
      context.requestQuit()
    },
  })

  commandRegistry.register({
    name: "?",
    description: "Open help modal",
    execute: (_args, context) => {
      context.dispatch(uiActions.setHelpOpen(true))
    },
  })

  commandRegistry.register({
    name: "zen",
    description: "Switch to zen mode",
    execute: (_args, context) => {
      context.dispatch(uiActions.setMode("zen"))
    },
  })

  commandRegistry.register({
    name: "normal",
    description: "Switch to normal mode",
    execute: (_args, context) => {
      context.dispatch(uiActions.setMode("normal"))
    },
  })

  commandRegistry.register({
    name: "search",
    description: "Switch to search mode or set query",
    execute: (args, context) => {
      context.dispatch(uiActions.setMode("search"))
      if (args.length > 0) {
        context.dispatch(searchActions.setQuery(args.join(" ")))
      }
    },
  })

  commandRegistry.register({
    name: "sidebar",
    description: "Set sidebar on, off or toggle",
    execute: (args, context) => {
      const arg = args[0] ?? ""
      const state = context.getState()

      if (arg === "toggle") {
        context.dispatch(uiActions.setSidebarCollapsed(!state.ui.sidebarCollapsed))
        return
      }

      if (arg === "on") {
        context.dispatch(uiActions.setSidebarCollapsed(false))
        return
      }

      if (arg === "off") {
        context.dispatch(uiActions.setSidebarCollapsed(true))
        return
      }

      context.dispatch(uiActions.setStatus({ message: "ERR: use :sidebar on|off|toggle", level: "err" }))
    },
  })

  commandRegistry.register({
    name: "theme",
    description: "List or set themes",
    execute: (args, context) => {
      if (args.length === 0 || args[0] === "list") {
        const ids = context.themeRegistry.list().map((item) => item.id)
        context.dispatch(uiActions.setStatus({ message: `INFO: ${ids.join("|")}`, level: "info" }))
        return
      }

      const themeId = args[0]
      if (context.themeRegistry.get(themeId)) {
        context.dispatch(settingsActions.setTheme(themeId))
        context.dispatch(uiActions.setStatus({ message: `OK: theme ${themeId}`, level: "ok" }))
        return
      }

      context.dispatch(uiActions.setStatus({ message: "ERR: unknown theme", level: "err" }))
    },
  })

  commandRegistry.register({
    name: "progress",
    description: "List or set progress style",
    execute: (args, context) => {
      if (args.length === 0 || args[0] === "list") {
        const ids = context.progressStyleRegistry.list().map((item) => item.id)
        const current = context.getState().settings.progressStyleId
        context.dispatch(uiActions.setStatus({ message: `INFO: current=${current} | available=${ids.join("|")}`, level: "info" }))
        return
      }

      const styleId = args[0]
      if (context.progressStyleRegistry.get(styleId)) {
        context.dispatch(settingsActions.setProgressStyle(styleId))
        context.dispatch(uiActions.setStatus({ message: `OK: progress style ${styleId}`, level: "ok" }))
        return
      }

      const ids = context.progressStyleRegistry.list().map((item) => item.id)
      context.dispatch(uiActions.setStatus({ message: `ERR: use :progress ${ids.join("|")}`, level: "err" }))
    },
  })

  commandRegistry.register({
    name: "cava",
    description: "List or set cava style",
    execute: (args, context) => {
      const action = args[0] ?? "list"

      if (action === "style") {
        const value = args[1]
        const styles = context.visualizerStyleRegistry.list()
        const ids = styles.map((item) => item.id)

        if (!value || value === "list") {
          const current = context.getState().settings.cavaStyleId
          context.dispatch(uiActions.setStatus({ message: `INFO: current=${current} | available=${ids.join("|")}`, level: "info" }))
          return
        }

        if (context.visualizerStyleRegistry.get(value)) {
          context.dispatch(settingsActions.setCavaStyle(value))
          context.dispatch(uiActions.setStatus({ message: `OK: cava style ${value}`, level: "ok" }))
          return
        }

        context.dispatch(uiActions.setStatus({ message: `ERR: use :cava style list|${ids.join("|")}`, level: "err" }))
        return
      }

      if (action === "source") {
        const value = args[1]

        if (!value || value === "list") {
          const current = context.getState().settings.cavaSourceMode
          context.dispatch(
            uiActions.setStatus({ message: `INFO: current=${current} | available=${cavaSourceModes.join("|")}`, level: "info" }),
          )
          return
        }

        if (cavaSourceModes.includes(value as (typeof cavaSourceModes)[number])) {
          context.dispatch(settingsActions.setCavaSourceMode(value as (typeof cavaSourceModes)[number]))
          context.dispatch(uiActions.setStatus({ message: `OK: cava source ${value}`, level: "ok" }))
          return
        }

        context.dispatch(uiActions.setStatus({ message: `ERR: use :cava source list|${cavaSourceModes.join("|")}`, level: "err" }))
        return
      }

      context.dispatch(uiActions.setStatus({ message: "ERR: use :cava style list|<id> OR :cava source list|<mode>", level: "err" }))
    },
  })

  commandRegistry.register({
    name: "provider",
    description: "Manage active provider",
    execute: (args, context) => {
      const action = args[0] ?? ""
      const state = context.getState()

      if (action === "list") {
        const ids = state.provider.available.map((provider) => provider.id)
        context.dispatch(uiActions.setStatus({ message: `INFO: providers=${ids.join("|")}`, level: "info" }))
        return
      }

      if (action === "current") {
        context.dispatch(uiActions.setStatus({ message: `INFO: current=${state.provider.activeProviderId}`, level: "info" }))
        return
      }

      if (action === "use") {
        const providerId = args[1]
        if (!providerId) {
          context.dispatch(uiActions.setStatus({ message: "ERR: use :provider use <id>", level: "err" }))
          return
        }

        const available = state.provider.available.some((provider) => provider.id === providerId)
        if (!available) {
          context.dispatch(uiActions.setStatus({ message: "ERR: provider not available", level: "err" }))
          return
        }

        context.dispatch(providerActions.setActiveProvider(providerId))
        context.dispatch(uiActions.setStatus({ message: `OK: provider ${providerId}`, level: "ok" }))
        return
      }

      context.dispatch(uiActions.setStatus({ message: "ERR: use :provider list|current|use <id>", level: "err" }))
    },
  })

  commandRegistry.register({
    name: "plugin",
    description: "Inspect loaded plugins",
    execute: (args, context) => {
      const action = args[0] ?? "list"
      const plugins = context.getState().plugins.installed

      if (action === "list") {
        if (plugins.length === 0) {
          context.dispatch(uiActions.setStatus({ message: "INFO: no plugins found", level: "info" }))
          return
        }

        const compact = plugins.map((plugin) => `${plugin.manifest.id}(${plugin.status})`).join(",")
        context.dispatch(uiActions.setStatus({ message: `INFO: ${compact}`, level: "info" }))
        return
      }

      if (action === "info") {
        const pluginId = args[1]
        if (!pluginId) {
          context.dispatch(uiActions.setStatus({ message: "ERR: use :plugin info <id>", level: "err" }))
          return
        }

        const plugin = plugins.find((item) => item.manifest.id === pluginId)
        if (!plugin) {
          context.dispatch(uiActions.setStatus({ message: "ERR: plugin not found", level: "err" }))
          return
        }

        context.dispatch(
          uiActions.setStatus({
            message: `INFO: ${plugin.manifest.name} - ${plugin.manifest.description}`,
            level: "info",
          }),
        )
        return
      }

      if (action === "reload") {
        context.dispatch(uiActions.setStatus({ message: "INFO: reload is planned in runtime plugin loader", level: "info" }))
        return
      }

      context.dispatch(uiActions.setStatus({ message: "ERR: use :plugin list|info <id>|reload", level: "err" }))
    },
  })
}
