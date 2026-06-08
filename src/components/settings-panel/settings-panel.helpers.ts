import type { AppDispatch, RootState } from "../../state/store/store.types"
import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeRegistry } from "../../registries/themes/theme.registry"
import type { VisualizerStyleRegistry } from "../../registries/visualizer-styles/visualizer-style.registry"
import { switchActiveProviderThunk } from "../../features/provider/provider.thunks"
import { settingsActions } from "../../features/settings/settings.slice"
import { uiActions } from "../../features/ui/ui.slice"
import type { SettingsRowDisplay } from "./settings-panel.types"

export type SettingCategory = "appearance" | "visualizer" | "behavior" | "providers" | "plugins"

export const SETTINGS_CATEGORIES: { id: SettingCategory; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "visualizer", label: "Visualizer" },
  { id: "behavior", label: "Behavior" },
  { id: "providers", label: "Providers" },
  { id: "plugins", label: "Plugins" },
]

export type SettingDescriptor = {
  display: SettingsRowDisplay
  onChange?: (dispatch: AppDispatch, direction: 1 | -1) => void
  disabled?: boolean
}

type Registries = {
  themeRegistry: ThemeRegistry
  progressStyleRegistry: ProgressStyleRegistry
  visualizerStyleRegistry: VisualizerStyleRegistry
}

function fmtRow(label: string, value: string): string {
  return `${label}: ${value}`
}

function cycleEnum(options: string[], current: string, direction: 1 | -1): string {
  const idx = options.indexOf(current)
  if (idx === -1) return options[0] ?? current
  return options[((idx + direction + options.length) % options.length)] ?? current
}

function buildAppearanceItems(state: RootState, registries: Registries, dispatch: AppDispatch): SettingDescriptor[] {
  const themes = registries.themeRegistry.list().map((t) => t.id)
  const progressStyles = registries.progressStyleRegistry.list().map((s) => s.id)

  return [
    {
      display: {
        name: fmtRow("Theme", state.settings.themeId),
        description: "Active color scheme  (← / →)",
      },
      onChange: (d, dir) => {
        const next = cycleEnum(themes, state.settings.themeId, dir)
        d(settingsActions.setTheme(next))
      },
    },
    {
      display: {
        name: fmtRow("Progress Style", state.settings.progressStyleId),
        description: "Player progress bar style  (← / →)",
      },
      onChange: (d, dir) => {
        const next = cycleEnum(progressStyles, state.settings.progressStyleId, dir)
        d(settingsActions.setProgressStyle(next))
      },
    },
  ]
}

function buildVisualizerItems(state: RootState, registries: Registries, dispatch: AppDispatch): SettingDescriptor[] {
  const cavaStyles = registries.visualizerStyleRegistry.list().map((s) => s.id)
  const sourceModes = ["ytui-strict", "ytui-best-effort", "system"] as const

  return [
    {
      display: {
        name: fmtRow("CAVA Enabled", state.settings.cavaEnabled ? "on" : "off"),
        description: "Show audio visualizer below the player  (← / →)",
      },
      onChange: (d) => {
        d(settingsActions.setCavaEnabled(!state.settings.cavaEnabled))
      },
    },
    {
      display: {
        name: fmtRow("CAVA Height", String(state.settings.cavaHeight)),
        description: "Visualizer rows (1–8)  (← / →)",
      },
      onChange: (d, dir) => {
        d(settingsActions.setCavaHeight(state.settings.cavaHeight + dir))
      },
    },
    {
      display: {
        name: fmtRow("CAVA Style", state.settings.cavaStyleId),
        description: "Visualizer glyph style  (← / →)",
      },
      onChange: (d, dir) => {
        const next = cycleEnum(cavaStyles, state.settings.cavaStyleId, dir)
        d(settingsActions.setCavaStyle(next))
      },
    },
    {
      display: {
        name: fmtRow("CAVA Source", state.settings.cavaSourceMode),
        description: "Audio capture mode  (← / →)",
      },
      onChange: (d, dir) => {
        const next = cycleEnum([...sourceModes], state.settings.cavaSourceMode, dir)
        d(settingsActions.setCavaSourceMode(next as typeof sourceModes[number]))
      },
    },
  ]
}

function buildBehaviorItems(state: RootState, _registries: Registries, _dispatch: AppDispatch): SettingDescriptor[] {
  const modes = ["normal", "search", "zen", "library", "logs"] as const
  const sidebarOptions = ["on", "off"]

  return [
    {
      display: {
        name: fmtRow("Default Mode", state.settings.defaultMode),
        description: "Mode on startup  (← / →)",
      },
      onChange: (d, dir) => {
        const next = cycleEnum([...modes], state.settings.defaultMode, dir)
        d(settingsActions.setDefaultMode(next as typeof modes[number]))
      },
    },
    {
      display: {
        name: fmtRow("Results Limit", String(state.settings.resultsLimit)),
        description: "Max search results (10–100, step 5)  (← / →)",
      },
      onChange: (d, dir) => {
        d(settingsActions.setResultsLimit(state.settings.resultsLimit + dir * 5))
      },
    },
    {
      display: {
        name: fmtRow("Status Timeout", `${state.settings.statusTimeoutMs}ms`),
        description: "Status bar message duration (500–10000ms, step 500)  (← / →)",
      },
      onChange: (d, dir) => {
        d(settingsActions.setStatusTimeout(state.settings.statusTimeoutMs + dir * 500))
      },
    },
    {
      display: {
        name: fmtRow("Sidebar Default", state.ui.sidebarCollapsed ? "off" : "on"),
        description: "Sidebar visibility on startup  (← / →)",
      },
      onChange: (d, dir) => {
        const current = state.ui.sidebarCollapsed ? "off" : "on"
        const next = cycleEnum(sidebarOptions, current, dir)
        d(uiActions.setSidebarCollapsed(next === "off"))
      },
    },
    {
      display: {
        name: fmtRow("Alternate Screen", state.settings.useAlternateScreen ? "on" : "off"),
        description: "Not available — renderer integration not yet implemented",
      },
      disabled: true,
    },
  ]
}

function buildProviderItems(state: RootState, _registries: Registries, _dispatch: AppDispatch): SettingDescriptor[] {
  if (state.provider.available.length === 0) {
    return [
      {
        display: {
          name: "No providers registered",
          description: "Providers are registered at startup via the provider manager",
        },
        disabled: true,
      },
    ]
  }

  const providerIds = state.provider.available.map((p) => p.id)
  const singleProvider = state.provider.available.length <= 1

  return state.provider.available.map((provider) => {
    const isActive = provider.id === state.provider.activeProviderId
    return {
      display: {
        name: fmtRow(provider.name, isActive ? "active" : ""),
        description: singleProvider
          ? "No additional providers available"
          : isActive
          ? provider.description
          : `${provider.description}  (← / → to activate)`,
      },
      onChange:
        isActive
          ? undefined
          : (d: AppDispatch, dir: 1 | -1) => {
              const next = cycleEnum(providerIds, state.provider.activeProviderId, dir)
              d(switchActiveProviderThunk(next))
            },
      disabled: singleProvider,
    }
  })
}

function buildPluginItems(state: RootState): SettingDescriptor[] {
  if (state.plugins.installed.length === 0) {
    return [
      {
        display: {
          name: "No plugins installed",
          description: "Install plugins at ~/.config/ytui/plugins/<id>/plugin.json",
        },
        disabled: true,
      },
    ]
  }

  return state.plugins.installed.map((plugin) => ({
    display: {
      name: `${plugin.manifest.name} v${plugin.manifest.version}  [${plugin.status}]`,
      description: plugin.status === "error" ? `Error: ${plugin.error ?? "unknown"}` : plugin.manifest.description,
    },
    disabled: true,
  }))
}

export function buildCategoryItems(
  category: SettingCategory,
  state: RootState,
  registries: Registries,
  dispatch: AppDispatch,
): SettingDescriptor[] {
  switch (category) {
    case "appearance":
      return buildAppearanceItems(state, registries, dispatch)
    case "visualizer":
      return buildVisualizerItems(state, registries, dispatch)
    case "behavior":
      return buildBehaviorItems(state, registries, dispatch)
    case "providers":
      return buildProviderItems(state, registries, dispatch)
    case "plugins":
      return buildPluginItems(state)
  }
}

export function buildCategoryDisplayItems(
  category: SettingCategory,
  state: RootState,
  registries: Registries,
): SettingsRowDisplay[] {
  // onChange closures are never invoked here; a no-op dispatch is safe for display-only rendering.
  const noop = (() => {}) as unknown as AppDispatch
  return buildCategoryItems(category, state, registries, noop).map((d) => ({
    ...d.display,
    disabled: d.disabled,
  }))
}
