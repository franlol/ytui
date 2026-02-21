import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { InstalledPlugin } from "../../types/plugin.types"
import type { PluginsState } from "./plugins.types"

const initialState: PluginsState = {
  installed: [],
}

export const pluginsSlice = createSlice({
  name: "plugins",
  initialState,
  reducers: {
    setPlugins(state, action: PayloadAction<InstalledPlugin[]>) {
      state.installed = action.payload
    },
  },
})

export const pluginsActions = pluginsSlice.actions
