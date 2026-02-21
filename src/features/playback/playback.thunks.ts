import { createAsyncThunk } from "@reduxjs/toolkit"
import { uiActions } from "../ui/ui.slice"
import { runStartVisualizerThunk, runStopVisualizerThunk } from "../visualizer/visualizer.thunks"
import { playbackActions } from "./playback.slice"
import type { AppServices, RootState } from "../../state/store/store.types"
import type { Track } from "../../types/app.types"

export const runPlayTrackThunk = createAsyncThunk<void, Track, { state: RootState; extra: AppServices }>(
  "playback/play-track",
  async (track, { dispatch, extra }) => {
    const provider = extra.providerManager.getActive()

    if (!provider?.playback) {
      dispatch(uiActions.setStatus({ message: "ERR: provider has no playback capability", level: "err" }))
      return
    }

    try {
      await dispatch(runStopVisualizerThunk())
      await provider.playback.play(track)
      dispatch(playbackActions.setNowPlaying(track))
      dispatch(playbackActions.setPlaying(true))

      const session = provider.playback.getPlaybackSession?.()
      if (session) {
        await dispatch(runStartVisualizerThunk(session))
      }

      dispatch(uiActions.setStatus({ message: `OK: playing ${track.title}`, level: "ok" }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Playback failed"
      dispatch(uiActions.setStatus({ message: `ERR: ${message}`, level: "err" }))
    }
  },
)

export const runTogglePauseResumeThunk = createAsyncThunk<void, void, { state: RootState; extra: AppServices }>(
  "playback/toggle-pause-resume",
  async (_payload, { dispatch, getState, extra }) => {
    const state = getState()
    const provider = extra.providerManager.getActive()

    if (!state.playback.nowPlaying) {
      dispatch(uiActions.setStatus({ message: "INFO: nothing playing", level: "info" }))
      return
    }

    if (!provider?.playback) {
      dispatch(uiActions.setStatus({ message: "ERR: provider has no playback capability", level: "err" }))
      return
    }

    try {
      if (state.playback.playing) {
        await provider.playback.pause()
        dispatch(playbackActions.setPlaying(false))
        dispatch(uiActions.setStatus({ message: "OK: paused", level: "ok" }))
        return
      }

      await provider.playback.resume()
      dispatch(playbackActions.setPlaying(true))
      dispatch(uiActions.setStatus({ message: "OK: playing", level: "ok" }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pause/resume failed"
      dispatch(uiActions.setStatus({ message: `ERR: ${message}`, level: "err" }))
    }
  },
)
