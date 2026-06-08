import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppServices, RootState } from "../../state/store/store.types"
import { libraryActions } from "./library.slice"

export const loadLibraryThunk = createAsyncThunk<void, void, { extra: AppServices; state: RootState }>(
  "library/load",
  async (_arg, { dispatch, extra }) => {
    const playlists = await extra.libraryService.load()
    dispatch(libraryActions.setPlaylists(playlists))
  },
)

export const saveLibraryThunk = createAsyncThunk<void, void, { extra: AppServices; state: RootState }>(
  "library/save",
  async (_arg, { getState, extra }) => {
    await extra.libraryService.save(getState().library.playlists)
  },
)
