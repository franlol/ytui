import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { VisualizerState } from "./visualizer.types"

const initialState: VisualizerState = {
  phase: 0,
  lines: [],
}

export const visualizerSlice = createSlice({
  name: "visualizer",
  initialState,
  reducers: {
    tickPhase(state) {
      state.phase += 1
    },
    setLines(state, action: PayloadAction<string[]>) {
      state.lines = action.payload
    },
  },
})

export const visualizerActions = visualizerSlice.actions
