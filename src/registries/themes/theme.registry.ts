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

  registry.register({
    id: "palenight",
    description: "Soft blue-purple Material Night palette",
    tokens: {
      bg: "#292d3e",
      panel: "#1b1e2b",
      panelAlt: "#3c435e",
      text: "#a6accd",
      muted: "#676e95",
      accent: "#c792ea",
      border: "#ffcb6b",
      status: "#1b1e2b",
      statusText: "#a6accd",
      selectedBg: "#444267",
      statusInfoText: "#a6accd",
      statusOkText: "#c3e88d",
      statusErrText: "#f07178",
    },
  })

  registry.register({
    id: "dracula",
    description: "Dark purple Dracula palette",
    tokens: {
      bg: "#282a36",
      panel: "#21222c",
      panelAlt: "#44475a",
      text: "#f8f8f2",
      muted: "#6272a4",
      accent: "#bd93f9",
      border: "#44475a",
      status: "#21222c",
      statusText: "#f8f8f2",
      selectedBg: "#44475a",
      statusInfoText: "#f8f8f2",
      statusOkText: "#50fa7b",
      statusErrText: "#ff5555",
    },
  })

  registry.register({
    id: "catppuccin",
    description: "Soothing pastel dark (Mocha)",
    tokens: {
      bg: "#1e1e2e",
      panel: "#181825",
      panelAlt: "#313244",
      text: "#cdd6f4",
      muted: "#6c7086",
      accent: "#cba6f7",
      border: "#45475a",
      status: "#181825",
      statusText: "#cdd6f4",
      selectedBg: "#313244",
      statusInfoText: "#cdd6f4",
      statusOkText: "#a6e3a1",
      statusErrText: "#f38ba8",
    },
  })

  registry.register({
    id: "one-dark",
    description: "Atom One Dark",
    tokens: {
      bg: "#282c34",
      panel: "#21252b",
      panelAlt: "#2c313a",
      text: "#abb2bf",
      muted: "#5c6370",
      accent: "#61afef",
      border: "#3e4452",
      status: "#21252b",
      statusText: "#abb2bf",
      selectedBg: "#2c313a",
      statusInfoText: "#abb2bf",
      statusOkText: "#98c379",
      statusErrText: "#e06c75",
    },
  })

  registry.register({
    id: "tokyo-night",
    description: "Deep blue-indigo Tokyo Night",
    tokens: {
      bg: "#1a1b26",
      panel: "#16161e",
      panelAlt: "#1f2335",
      text: "#c0caf5",
      muted: "#565f89",
      accent: "#7aa2f7",
      border: "#292e42",
      status: "#16161e",
      statusText: "#c0caf5",
      selectedBg: "#1f2335",
      statusInfoText: "#c0caf5",
      statusOkText: "#9ece6a",
      statusErrText: "#f7768e",
    },
  })

  registry.register({
    id: "solarized-dark",
    description: "Ethan Schoonover Solarized dark",
    tokens: {
      bg: "#002b36",
      panel: "#073642",
      panelAlt: "#0d4a58",
      text: "#839496",
      muted: "#586e75",
      accent: "#268bd2",
      border: "#094555",
      status: "#073642",
      statusText: "#93a1a1",
      selectedBg: "#0d4a58",
      statusInfoText: "#93a1a1",
      statusOkText: "#859900",
      statusErrText: "#dc322f",
    },
  })

  return registry
}
