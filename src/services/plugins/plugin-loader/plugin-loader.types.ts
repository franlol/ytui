import type { PluginManifest } from "../../../types/plugin.types"

export type PluginLoadResult = {
  manifest: PluginManifest
  enabled: boolean
  error?: string
}
