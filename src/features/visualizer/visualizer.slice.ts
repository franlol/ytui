import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { VisualizerState } from "./visualizer.types"

const initialState: VisualizerState = {
  bars: [],
  running: false,
  unavailable: false,
  error: null,
  sessionId: null,
}

export const visualizerSlice = createSlice({
  name: "visualizer",
  initialState,
  reducers: {
    setBars(state, action: PayloadAction<number[]>) {
      state.bars = action.payload
    },
    setRunning(state, action: PayloadAction<boolean>) {
      state.running = action.payload
    },
    setUnavailable(state, action: PayloadAction<boolean>) {
      state.unavailable = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setSession(state, action: PayloadAction<string | null>) {
      state.sessionId = action.payload
    },
    reset(state) {
      state.bars = []
      state.running = false
      state.error = null
      state.sessionId = null
    },
  },
})

export const visualizerActions = visualizerSlice.actions
