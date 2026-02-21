import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Mode } from "../../types/app.types"
import type { AppConfig } from "../../types/config.types"
import type { SettingsState } from "./settings.types"

const initialState: SettingsState = {
  themeId: "gruvbox",
  progressStyleId: "blocks",
  cavaStyleId: "blocks",
  resultsLimit: 20,
  cavaEnabled: true,
  cavaHeight: 2,
  statusTimeoutMs: 2200,
  useAlternateScreen: false,
  defaultMode: "normal",
}

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    applyConfig(state, action: PayloadAction<AppConfig>) {
      state.themeId = action.payload.theme
      state.progressStyleId = action.payload.progressStyle
      state.cavaStyleId = action.payload.cavaStyle
      state.resultsLimit = action.payload.resultsLimit
      state.cavaEnabled = action.payload.cavaEnabled
      state.cavaHeight = action.payload.cavaHeight
      state.statusTimeoutMs = action.payload.statusTimeoutMs
      state.useAlternateScreen = action.payload.useAlternateScreen
      state.defaultMode = action.payload.defaultMode
    },
    setTheme(state, action: PayloadAction<string>) {
      state.themeId = action.payload
    },
    setProgressStyle(state, action: PayloadAction<string>) {
      state.progressStyleId = action.payload
    },
    setCavaStyle(state, action: PayloadAction<string>) {
      state.cavaStyleId = action.payload
    },
    setDefaultMode(state, action: PayloadAction<Mode>) {
      state.defaultMode = action.payload
    },
  },
})

export const settingsActions = settingsSlice.actions
