import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track } from "../../types/app.types"
import type { QueueState } from "./queue.types"

const initialState: QueueState = {
  tracks: [],
  selectedIndex: 0,
}

export const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setQueue(state, action: PayloadAction<Track[]>) {
      state.tracks = action.payload
      state.selectedIndex = 0
    },
    setSelectedIndex(state, action: PayloadAction<number>) {
      if (state.tracks.length === 0) {
        state.selectedIndex = 0
        return
      }
      state.selectedIndex = Math.max(0, Math.min(action.payload, state.tracks.length - 1))
    },
    moveSelectionDown(state) {
      state.selectedIndex = Math.min(state.selectedIndex + 1, Math.max(0, state.tracks.length - 1))
    },
    moveSelectionUp(state) {
      state.selectedIndex = Math.max(0, state.selectedIndex - 1)
    },
    enqueueTrack(state, action: PayloadAction<Track>) {
      state.tracks.push(action.payload)
    },
    removeTrackRange(state, action: PayloadAction<{ index: number; count: number }>) {
      const { index, count } = action.payload
      const actual = Math.min(count, state.tracks.length - index)
      state.tracks.splice(index, actual)
      if (state.tracks.length === 0) {
        state.selectedIndex = 0
      } else {
        const removedBefore = Math.min(actual, Math.max(0, state.selectedIndex - index))
        state.selectedIndex = Math.min(state.selectedIndex - removedBefore, state.tracks.length - 1)
      }
    },
    clearQueue(state) {
      state.tracks = []
      state.selectedIndex = 0
    },
  },
})

export const queueActions = queueSlice.actions
