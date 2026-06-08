import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track } from "../../types/app.types"
import type { QueueState, RepeatMode } from "./queue.types"

const initialState: QueueState = {
  tracks: [],
  selectedIndex: 0,
  playingIndex: null,
  repeatMode: "none",
  shuffleEnabled: false,
}

export const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setQueue(state, action: PayloadAction<Track[]>) {
      state.tracks = action.payload
      state.selectedIndex = 0
      state.playingIndex = null
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
        state.playingIndex = null
      } else {
        const removedBeforeSel = Math.min(actual, Math.max(0, state.selectedIndex - index))
        state.selectedIndex = Math.min(state.selectedIndex - removedBeforeSel, state.tracks.length - 1)

        if (state.playingIndex !== null) {
          const removedBeforePlay = Math.min(actual, Math.max(0, state.playingIndex - index))
          const adjusted = state.playingIndex - removedBeforePlay
          // If the playing track itself was removed, clear playingIndex
          if (state.playingIndex >= index && state.playingIndex < index + actual) {
            state.playingIndex = null
          } else {
            state.playingIndex = Math.min(adjusted, state.tracks.length - 1)
          }
        }
      }
    },
    clearQueue(state) {
      state.tracks = []
      state.selectedIndex = 0
      state.playingIndex = null
    },
    setPlayingIndex(state, action: PayloadAction<number | null>) {
      if (action.payload === null) {
        state.playingIndex = null
        return
      }
      if (state.tracks.length === 0) {
        state.playingIndex = null
        return
      }
      state.playingIndex = Math.max(0, Math.min(action.payload, state.tracks.length - 1))
    },
    setRepeatMode(state, action: PayloadAction<RepeatMode>) {
      state.repeatMode = action.payload
    },
    cycleRepeatMode(state) {
      const order: RepeatMode[] = ["none", "one", "all"]
      const current = order.indexOf(state.repeatMode)
      state.repeatMode = order[(current + 1) % order.length]
    },
    setShuffleEnabled(state, action: PayloadAction<boolean>) {
      state.shuffleEnabled = action.payload
    },
    toggleShuffle(state) {
      state.shuffleEnabled = !state.shuffleEnabled
    },
  },
})

export const queueActions = queueSlice.actions
