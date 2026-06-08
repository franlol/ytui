import { createAsyncThunk } from "@reduxjs/toolkit"
import { libraryActions } from "../library/library.slice"
import { saveLibraryThunk } from "../library/library.thunks"
import { uiActions } from "../ui/ui.slice"
import { runStartVisualizerThunk, runStopVisualizerThunk } from "../visualizer/visualizer.thunks"
import { playbackActions } from "./playback.slice"
import type { AppServices, RootState } from "../../state/store/store.types"
import type { Track } from "../../types/app.types"

export const runPlayTrackThunk = createAsyncThunk<void, Track, { state: RootState; extra: AppServices }>(
  "playback/play-track",
  async (track, { dispatch, getState, extra }) => {
    const provider = extra.providerManager.getActive()
    const state = getState()

    if (!provider?.playback) {
      dispatch(uiActions.setStatus({ message: "ERR: provider has no playback capability", level: "err" }))
      return
    }

    dispatch(playbackActions.setNowPlaying(track))

    try {
      await dispatch(runStopVisualizerThunk())
      await provider.playback.play(track, { cavaSourceMode: state.settings.cavaSourceMode })
      dispatch(playbackActions.setPlaying(true))
      dispatch(libraryActions.prependToHistory(track))
      void dispatch(saveLibraryThunk())

      const session = provider.playback.getPlaybackSession?.()
      if (session) {
        await dispatch(runStartVisualizerThunk(session))
      }

      dispatch(uiActions.setStatus({ message: `OK: playing ${track.title}`, level: "ok" }))
    } catch (error) {
      dispatch(playbackActions.setNowPlaying(null))
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

export const runSeekPlaybackThunk = createAsyncThunk<void, { targetSec: number }, { state: RootState; extra: AppServices }>(
  "playback/seek",
  async ({ targetSec }, { dispatch, getState, extra }) => {
    const state = getState()
    const provider = extra.providerManager.getActive()

    if (!state.playback.nowPlaying) {
      return
    }

    if (!provider?.playback) {
      dispatch(uiActions.setStatus({ message: "ERR: provider has no playback capability", level: "err" }))
      return
    }

    if (!provider.playback.seekTo) {
      dispatch(uiActions.setStatus({ message: "ERR: seek not supported by provider", level: "err" }))
      return
    }

    const clampedTargetSec = Math.max(0, Math.min(state.playback.durationSec, Math.round(targetSec)))

    try {
      await provider.playback.seekTo(clampedTargetSec)
      dispatch(playbackActions.setElapsedSec(clampedTargetSec))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Seek failed"
      dispatch(uiActions.setStatus({ message: `ERR: ${message}`, level: "err" }))
    }
  },
)

export const runSyncPlaybackProgressThunk = createAsyncThunk<void, void, { state: RootState; extra: AppServices }>(
  "playback/sync-progress",
  async (_payload, { dispatch, getState, extra }) => {
    const state = getState()

    const provider = extra.providerManager.getActive()
    const playback = provider?.playback
    if (!playback) {
      return
    }

    if (!playback.getProgress) {
      if (state.playback.nowPlaying) {
        dispatch(playbackActions.tick())
      }
      return
    }

    try {
      const progress = await playback.getProgress()
      dispatch(playbackActions.applyRuntimeProgress(progress))
      if (progress.available) {
        return
      }
    } catch {
      // runtime sync failed this tick; fallback below
    }

    if (!state.playback.nowPlaying) {
      return
    }

    const misses = state.playback.syncMisses + 1
    dispatch(playbackActions.setSyncMisses(misses))
    if (state.playback.playing && misses >= 3) {
      dispatch(playbackActions.setNowPlaying(null))
    } else if (state.playback.playing) {
      dispatch(playbackActions.tick())
    }
  },
)
