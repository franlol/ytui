import type { InstalledPlugin } from "../../types/plugin.types"

export type PluginsState = {
  installed: InstalledPlugin[]
  // Mirrors PLUGINS_ENABLED / PLUGINS from ytui.conf so config saves can
  // round-trip the user's plugin configuration instead of resetting it.
  pluginsEnabled: boolean
  configuredIds: string[]
}
