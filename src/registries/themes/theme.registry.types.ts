export type ThemeTokens = {
  bg: string
  panel: string
  panelAlt: string
  text: string
  muted: string
  accent: string
  border: string
  status: string
  statusText: string
  selectedBg: string
}

export type ThemeDefinition = {
  id: string
  description: string
  tokens: ThemeTokens
}
