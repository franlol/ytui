import { createAsyncThunk } from "@reduxjs/toolkit"
import { logsActions } from "../logs/logs.slice"
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
      dispatch(logsActions.addEntry({ level: "warn", source: "visualizer", message: "CAVA source unavailable — disabled" }))
      return
    }

    if (session.visualizerSourceMode === "ytui-strict" && !session.visualizerSourceVerified) {
      dispatch(visualizerActions.setUnavailable(true))
      dispatch(visualizerActions.setRunning(false))
      dispatch(visualizerActions.setError("ytui-isolated source could not be verified"))
      dispatch(logsActions.addEntry({ level: "warn", source: "visualizer", message: "ytui-strict isolation check failed — CAVA disabled" }))
      dispatch(uiActions.setStatus({ message: "INFO: visualizer disabled (ytui isolation check failed)", level: "info" }))
      return
    }

    if (session.visualizerSourceMode === "ytui-best-effort" && !session.visualizerSourceVerified) {
      dispatch(logsActions.addEntry({ level: "warn", source: "visualizer", message: "best-effort source unverified — CAVA may capture system audio" }))
      dispatch(uiActions.setStatus({ message: "INFO: visualizer running in best-effort source mode", level: "info" }))
    }

    dispatch(visualizerActions.setSession(session.id))
    dispatch(visualizerActions.setUnavailable(false))
    dispatch(visualizerActions.setRunning(true))
    dispatch(visualizerActions.setError(null))
    dispatch(logsActions.addEntry({ level: "info", source: "visualizer", message: `started (mode: ${session.visualizerSourceMode ?? "default"})` }))

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
            dispatch(logsActions.addEntry({ level: "error", source: "visualizer", message: `runtime error: ${error}` }))
          }
        },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "failed to start visualizer"
      dispatch(visualizerActions.setRunning(false))
      dispatch(visualizerActions.setUnavailable(true))
      dispatch(visualizerActions.setError(message))
      dispatch(logsActions.addEntry({ level: "error", source: "visualizer", message: `start failed: ${message}` }))
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
