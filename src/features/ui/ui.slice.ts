import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Mode, StatusLevel } from "../../types/app.types"
import type { UiState } from "./ui.types"

const initialState: UiState = {
  mode: "normal",
  sidebarCollapsed: false,
  commandActive: false,
  commandBuffer: "",
  helpOpen: false,
  themePickerOpen: false,
  themePickerSelectedIndex: 0,
  themePickerPreviousId: "",
  playlistPickerOpen: false,
  playlistPickerSelectedIndex: 0,
  statusMessage: null,
  statusLevel: null,
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload
    },
    cycleMode(state) {
      const order: Mode[] = ["search", "normal", "zen", "library", "logs"]
      const index = order.indexOf(state.mode)
      state.mode = order[(index + 1) % order.length]
    },
    cycleModeBack(state) {
      const order: Mode[] = ["search", "normal", "zen", "library", "logs"]
      const index = order.indexOf(state.mode)
      state.mode = order[(index - 1 + order.length) % order.length]
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    setCommandActive(state, action: PayloadAction<boolean>) {
      state.commandActive = action.payload
    },
    setCommandBuffer(state, action: PayloadAction<string>) {
      state.commandBuffer = action.payload
    },
    setHelpOpen(state, action: PayloadAction<boolean>) {
      state.helpOpen = action.payload
    },
    openThemePicker(state, action: PayloadAction<{ selectedIndex: number; previousId: string }>) {
      state.themePickerOpen = true
      state.themePickerSelectedIndex = action.payload.selectedIndex
      state.themePickerPreviousId = action.payload.previousId
    },
    closeThemePicker(state) {
      state.themePickerOpen = false
    },
    openPlaylistPicker(state, action: PayloadAction<number>) {
      state.playlistPickerOpen = true
      state.playlistPickerSelectedIndex = action.payload
    },
    closePlaylistPicker(state) {
      state.playlistPickerOpen = false
    },
    movePlaylistPickerDown(state, action: PayloadAction<number>) {
      state.playlistPickerSelectedIndex = Math.min(state.playlistPickerSelectedIndex + 1, action.payload - 1)
    },
    movePlaylistPickerUp(state) {
      state.playlistPickerSelectedIndex = Math.max(0, state.playlistPickerSelectedIndex - 1)
    },
    moveThemePickerDown(state, action: PayloadAction<number>) {
      state.themePickerSelectedIndex = Math.min(state.themePickerSelectedIndex + 1, action.payload - 1)
    },
    moveThemePickerUp(state) {
      state.themePickerSelectedIndex = Math.max(0, state.themePickerSelectedIndex - 1)
    },
    setStatus(state, action: PayloadAction<{ message: string; level: StatusLevel }>) {
      state.statusMessage = action.payload.message
      state.statusLevel = action.payload.level
    },
    clearStatus(state) {
      state.statusMessage = null
      state.statusLevel = null
    },
  },
})

export const uiActions = uiSlice.actions
