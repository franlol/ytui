import type { ThemeDefinition, ThemeTokenInput, ThemeTokens } from "./theme.registry.types"

const FALLBACK_TOKENS: ThemeTokens = {
  bg: "#111111",
  panel: "#1a1a1a",
  panelAlt: "#222222",
  text: "#ffffff",
  muted: "#aaaaaa",
  accent: "#33ccff",
  border: "#444444",
  status: "#222222",
  statusText: "#ffffff",
  selectedBg: "#333333",
  statusInfoText: "#ffffff",
  statusOkText: "#66cc66",
  statusErrText: "#ff6666",
}

function resolveThemeTokens(tokens: ThemeTokenInput): ThemeTokens {
  return {
    ...tokens,
    statusInfoText: tokens.statusInfoText ?? tokens.statusText,
    statusOkText: tokens.statusOkText ?? FALLBACK_TOKENS.statusOkText,
    statusErrText: tokens.statusErrText ?? FALLBACK_TOKENS.statusErrText,
  }
}

export class ThemeRegistry {
  private definitions = new Map<string, ThemeDefinition>()

  register(definition: ThemeDefinition) {
    this.definitions.set(definition.id, definition)
  }

  get(themeId: string): ThemeDefinition | undefined {
    return this.definitions.get(themeId)
  }

  getTokens(themeId: string, fallback = "gruvbox"): ThemeTokens {
    const themeTokens = this.definitions.get(themeId)?.tokens
    if (themeTokens) {
      return resolveThemeTokens(themeTokens)
    }

    const fallbackTokens = this.definitions.get(fallback)?.tokens
    if (fallbackTokens) {
      return resolveThemeTokens(fallbackTokens)
    }

    return FALLBACK_TOKENS
  }

  list(): ThemeDefinition[] {
    return Array.from(this.definitions.values())
  }
}

export function createDefaultThemeRegistry(): ThemeRegistry {
  const registry = new ThemeRegistry()

  registry.register({
    id: "gruvbox",
    description: "Warm retro default",
    tokens: {
      bg: "#1d2021",
      panel: "#282828",
      panelAlt: "#32302f",
      text: "#ebdbb2",
      muted: "#a89984",
      accent: "#fabd2f",
      border: "#665c54",
      status: "#3c3836",
      statusText: "#fbf1c7",
      selectedBg: "#504945",
      statusInfoText: "#fbf1c7",
      statusOkText: "#b8bb26",
      statusErrText: "#fb4934",
    },
  })

  registry.register({
    id: "nord",
    description: "Cool nordic palette",
    tokens: {
      bg: "#2e3440",
      panel: "#3b4252",
      panelAlt: "#434c5e",
      text: "#eceff4",
      muted: "#d8dee9",
      accent: "#88c0d0",
      border: "#4c566a",
      status: "#434c5e",
      statusText: "#eceff4",
      selectedBg: "#5e81ac",
      statusInfoText: "#eceff4",
      statusOkText: "#a3be8c",
      statusErrText: "#bf616a",
    },
  })

  registry.register({
    id: "matrix",
    description: "Green phosphor terminal",
    tokens: {
      bg: "#050805",
      panel: "#0a150a",
      panelAlt: "#0d1d0d",
      text: "#84ff84",
      muted: "#3ab53a",
      accent: "#00ff66",
      border: "#1f7a1f",
      status: "#102810",
      statusText: "#93ff93",
      selectedBg: "#134013",
      statusInfoText: "#93ff93",
      statusOkText: "#84ff84",
      statusErrText: "#ff6b6b",
    },
  })

  return registry
}
