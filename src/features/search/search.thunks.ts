import { createAsyncThunk } from "@reduxjs/toolkit"
import { uiActions } from "../ui/ui.slice"
import { searchActions } from "./search.slice"
import type { AppServices, RootState } from "../../state/store/store.types"

export const runSearchThunk = createAsyncThunk<void, void, { state: RootState; extra: AppServices }>(
  "search/run",
  async (_payload, { getState, dispatch, extra }) => {
    const state = getState()
    const query = state.search.query
    const limit = state.settings.resultsLimit

    dispatch(searchActions.searchStart())
    const provider = extra.providerManager.getActive()

    if (!provider?.search) {
      dispatch(searchActions.searchError("Active provider does not support search"))
      dispatch(uiActions.setStatus({ message: "ERR: provider has no search capability", level: "err" }))
      return
    }

    try {
      const results = await provider.search.search(query, limit)
      dispatch(searchActions.searchSuccess(results))
      dispatch(uiActions.setStatus({ message: `OK: ${results.length} result(s)`, level: "ok" }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed"
      dispatch(searchActions.searchError(message))
      dispatch(uiActions.setStatus({ message: `ERR: ${message}`, level: "err" }))
    }
  },
)
