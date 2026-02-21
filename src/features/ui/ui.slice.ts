import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Mode, StatusLevel } from "../../types/app.types"
import type { UiState } from "./ui.types"

const initialState: UiState = {
  mode: "normal",
  sidebarCollapsed: false,
  commandActive: false,
  commandBuffer: "",
  helpOpen: false,
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
      const order: Mode[] = ["normal", "search", "zen"]
      const index = order.indexOf(state.mode)
      state.mode = order[(index + 1) % order.length]
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
