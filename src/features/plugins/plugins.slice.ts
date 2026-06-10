import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { InstalledPlugin } from "../../types/plugin.types"
import type { PluginsState } from "./plugins.types"

const initialState: PluginsState = {
  installed: [],
  pluginsEnabled: true,
  configuredIds: [],
}

export const pluginsSlice = createSlice({
  name: "plugins",
  initialState,
  reducers: {
    setPlugins(state, action: PayloadAction<InstalledPlugin[]>) {
      state.installed = action.payload
    },
    setPluginConfig(state, action: PayloadAction<{ pluginsEnabled: boolean; configuredIds: string[] }>) {
      state.pluginsEnabled = action.payload.pluginsEnabled
      state.configuredIds = action.payload.configuredIds
    },
  },
})

export const pluginsActions = pluginsSlice.actions
