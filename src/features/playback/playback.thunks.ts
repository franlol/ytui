import { createAsyncThunk } from "@reduxjs/toolkit"
import { libraryActions } from "../library/library.slice"
import { saveLibraryThunk } from "../library/library.thunks"
import { logsActions } from "../logs/logs.slice"
import { queueActions } from "../queue/queue.slice"
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
    dispatch(logsActions.addEntry({ level: "info", source: "playback", message: `play: "${track.title}" [${track.id}]` }))

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
      dispatch(logsActions.addEntry({ level: "error", source: "playback", message }))
      dispatch(uiActions.setStatus({ message: `ERR: ${message}`, level: "err" }))
    }
  },
)

export const runPlayNextInQueueThunk = createAsyncThunk<void, void, { state: RootState; extra: AppServices }>(
  "queue/play-next",
  async (_payload, { dispatch, getState }) => {
    const { tracks, playingIndex, repeatMode, shuffleEnabled } = getState().queue

    if (tracks.length === 0) return

    let nextIndex: number | null = null

    if (repeatMode === "one" && playingIndex !== null) {
      nextIndex = playingIndex
    } else if (shuffleEnabled) {
      nextIndex = Math.floor(Math.random() * tracks.length)
    } else {
      const current = playingIndex ?? -1
      const candidate = current + 1
      if (candidate < tracks.length) {
        nextIndex = candidate
      } else if (repeatMode === "all") {
        nextIndex = 0
      }
    }

    if (nextIndex === null) {
      dispatch(queueActions.setPlayingIndex(null))
      return
    }

    dispatch(queueActions.setPlayingIndex(nextIndex))
    dispatch(queueActions.setSelectedIndex(nextIndex))
    await dispatch(runPlayTrackThunk(tracks[nextIndex]))
  },
)

export const runPlayPreviousInQueueThunk = createAsyncThunk<void, void, { state: RootState; extra: AppServices }>(
  "queue/play-prev",
  async (_payload, { dispatch, getState }) => {
    const { tracks, playingIndex, repeatMode, shuffleEnabled } = getState().queue

    if (tracks.length === 0) return

    let prevIndex: number | null = null

    if (shuffleEnabled) {
      prevIndex = Math.floor(Math.random() * tracks.length)
    } else {
      const current = playingIndex ?? tracks.length
      const candidate = current - 1
      if (candidate >= 0) {
        prevIndex = candidate
      } else if (repeatMode === "all") {
        prevIndex = tracks.length - 1
      }
    }

    if (prevIndex === null) {
      dispatch(uiActions.setStatus({ message: "INFO: already at first track", level: "info" }))
      return
    }

    dispatch(queueActions.setPlayingIndex(prevIndex))
    dispatch(queueActions.setSelectedIndex(prevIndex))
    await dispatch(runPlayTrackThunk(tracks[prevIndex]))
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
      dispatch(logsActions.addEntry({ level: "error", source: "playback", message }))
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
      dispatch(logsActions.addEntry({ level: "error", source: "playback", message: `seek failed: ${message}` }))
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
      void dispatch(runPlayNextInQueueThunk())
    } else if (state.playback.playing) {
      dispatch(playbackActions.tick())
    }
  },
)
