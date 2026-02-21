export type PluginManifest = {
  id: string
  name: string
  version: string
  description: string
  author?: string
  apiVersion: string
  entry: string
}

export type PluginStatus = "loaded" | "disabled" | "error"

export type InstalledPlugin = {
  manifest: PluginManifest
  status: PluginStatus
  error?: string
}
