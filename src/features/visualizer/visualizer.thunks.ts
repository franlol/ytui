import { createAsyncThunk } from "@reduxjs/toolkit"
import { uiActions } from "../ui/ui.slice"
import { visualizerActions } from "./visualizer.slice"
import type { RootState, AppServices } from "../../state/store/store.types"
import type { PlaybackSession } from "../../services/playback/playback.service.types"

export const runStartVisualizerThunk = createAsyncThunk<void, PlaybackSession, { state: RootState; extra: AppServices }>(
  "visualizer/start",
  async (session, { dispatch, getState, extra }) => {
    const state = getState()

    if (!state.settings.cavaEnabled) {
      dispatch(visualizerActions.reset())
      return
    }

    if (!session.visualizerSource) {
      dispatch(visualizerActions.setUnavailable(true))
      dispatch(visualizerActions.setRunning(false))
      dispatch(visualizerActions.setError("ytui visualizer source unavailable"))
      return
    }

    dispatch(visualizerActions.setSession(session.id))
    dispatch(visualizerActions.setUnavailable(false))
    dispatch(visualizerActions.setRunning(true))
    dispatch(visualizerActions.setError(null))

    try {
      await extra.visualizerService.start(
        { id: session.id, source: session.visualizerSource },
        (bars) => {
          const currentSession = getState().visualizer.sessionId
          if (currentSession === session.id) {
            dispatch(visualizerActions.setBars(bars))
          }
        },
        (error) => {
          const currentSession = getState().visualizer.sessionId
          if (currentSession === session.id) {
            dispatch(visualizerActions.setRunning(false))
            dispatch(visualizerActions.setError(error))
          }
        },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "failed to start visualizer"
      dispatch(visualizerActions.setRunning(false))
      dispatch(visualizerActions.setUnavailable(true))
      dispatch(visualizerActions.setError(message))
      dispatch(uiActions.setStatus({ message: `INFO: visualizer unavailable (${message})`, level: "info" }))
    }
  },
)

export const runStopVisualizerThunk = createAsyncThunk<void, void, { state: RootState; extra: AppServices }>(
  "visualizer/stop",
  async (_payload, { dispatch, extra }) => {
    await extra.visualizerService.stop()
    dispatch(visualizerActions.reset())
  },
)
