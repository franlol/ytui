export type ThemeBaseTokens = {
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

export type ThemeSemanticStatusTokens = {
  statusInfoText: string
  statusOkText: string
  statusErrText: string
}

export type ThemeTokens = ThemeBaseTokens & ThemeSemanticStatusTokens

export type ThemeTokenInput = ThemeBaseTokens & Partial<ThemeSemanticStatusTokens>

export type ThemeDefinition = {
  id: string
  description: string
  tokens: ThemeTokenInput
}
