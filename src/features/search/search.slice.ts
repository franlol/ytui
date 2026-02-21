import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track } from "../../types/app.types"
import type { SearchState } from "./search.types"

const initialState: SearchState = {
  query: "nujabes feather",
  results: [],
  selectedIndex: 0,
  isLoading: false,
  error: null,
}

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
    searchStart(state) {
      state.isLoading = true
      state.error = null
    },
    searchSuccess(state, action: PayloadAction<Track[]>) {
      state.results = action.payload
      state.selectedIndex = 0
      state.isLoading = false
      state.error = null
    },
    searchError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.isLoading = false
    },
    setSelectedIndex(state, action: PayloadAction<number>) {
      if (state.results.length === 0) {
        state.selectedIndex = 0
        return
      }
      state.selectedIndex = Math.max(0, Math.min(action.payload, state.results.length - 1))
    },
    moveSelectionDown(state) {
      state.selectedIndex = Math.min(state.selectedIndex + 1, Math.max(0, state.results.length - 1))
    },
    moveSelectionUp(state) {
      state.selectedIndex = Math.max(0, state.selectedIndex - 1)
    },
  },
})

export const searchActions = searchSlice.actions
