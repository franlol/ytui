import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track } from "../../types/app.types"
import type { PlaybackState } from "./playback.types"

const initialState: PlaybackState = {
  nowPlaying: null,
  elapsedSec: 0,
  durationSec: 1,
  playing: false,
  volume: 72,
  syncMisses: 0,
}

export const playbackSlice = createSlice({
  name: "playback",
  initialState,
  reducers: {
    setNowPlaying(state, action: PayloadAction<Track | null>) {
      state.nowPlaying = action.payload
      if (action.payload) {
        state.durationSec = Math.max(1, action.payload.durationSec)
        state.elapsedSec = 0
        state.playing = false
        state.syncMisses = 0
      }
    },
    setPlaying(state, action: PayloadAction<boolean>) {
      state.playing = action.payload
    },
    togglePlaying(state) {
      state.playing = !state.playing
    },
    tick(state) {
      if (!state.playing) {
        return
      }
      state.elapsedSec = Math.min(state.durationSec, state.elapsedSec + 1)
    },
    setElapsedSec(state, action: PayloadAction<number>) {
      state.elapsedSec = Math.max(0, Math.min(state.durationSec, Math.round(action.payload)))
    },
    applyRuntimeProgress(
      state,
      action: PayloadAction<{ elapsedSec: number; durationSec: number | null; paused: boolean; available: boolean }>,
    ) {
      const payload = action.payload
      if (!payload.available) {
        return
      }

      if (payload.durationSec !== null) {
        state.durationSec = Math.max(1, Math.round(payload.durationSec))
      }

      state.elapsedSec = Math.max(0, Math.min(state.durationSec, Math.round(payload.elapsedSec)))
      state.playing = !payload.paused
      state.syncMisses = 0
    },
    setSyncMisses(state, action: PayloadAction<number>) {
      state.syncMisses = Math.max(0, Math.round(action.payload))
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(100, action.payload))
    },
  },
})

export const playbackActions = playbackSlice.actions
