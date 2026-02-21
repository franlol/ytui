export type AppConfig = {
  configVersion: number
  theme: string
  progressStyle: string
  sidebar: "on" | "off"
  defaultMode: "normal" | "search" | "zen"
  resultsLimit: number
  cavaEnabled: boolean
  cavaHeight: number
  statusTimeoutMs: number
  useAlternateScreen: boolean
  pluginsEnabled: boolean
  plugins: string[]
  providerDefault: string
  providersEnabled: string[]
}
