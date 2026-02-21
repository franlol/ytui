import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track } from "../../types/app.types"
import type { PlaybackState } from "./playback.types"

const initialState: PlaybackState = {
  nowPlaying: null,
  elapsedSec: 0,
  durationSec: 1,
  playing: true,
  volume: 72,
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
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(100, action.payload))
    },
  },
})

export const playbackActions = playbackSlice.actions
