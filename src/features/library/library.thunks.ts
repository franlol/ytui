import { createAsyncThunk } from "@reduxjs/toolkit"
import { logsActions } from "../logs/logs.slice"
import type { AppServices, RootState } from "../../state/store/store.types"
import { libraryActions } from "./library.slice"

export const loadLibraryThunk = createAsyncThunk<void, void, { extra: AppServices; state: RootState }>(
  "library/load",
  async (_arg, { dispatch, extra }) => {
    try {
      const playlists = await extra.libraryService.load()
      dispatch(libraryActions.setPlaylists(playlists))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load library"
      dispatch(logsActions.addEntry({ level: "error", source: "library", message: `load failed: ${message}` }))
    }
  },
)

export const saveLibraryThunk = createAsyncThunk<void, void, { extra: AppServices; state: RootState }>(
  "library/save",
  async (_arg, { dispatch, getState, extra }) => {
    try {
      await extra.libraryService.save(getState().library.playlists)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save library"
      dispatch(logsActions.addEntry({ level: "error", source: "library", message: `save failed: ${message}` }))
    }
  },
)
