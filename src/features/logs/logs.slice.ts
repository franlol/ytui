import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { LogEntry, LogLevel, LogsState } from "./logs.slice.types"

let nextId = 0

const initialState: LogsState = {
  entries: [],
  scrollOffset: 0,
  maxEntries: 500,
}

export const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    addEntry(state, action: PayloadAction<{ level: LogLevel; source: string; message: string }>) {
      const wasAtBottom = state.entries.length === 0 || state.scrollOffset >= state.entries.length - 1

      const entry: LogEntry = {
        id: String(nextId++),
        timestamp: Date.now(),
        ...action.payload,
      }

      state.entries.push(entry)

      if (state.entries.length > state.maxEntries) {
        state.entries.shift()
        state.scrollOffset = Math.max(0, state.scrollOffset - 1)
      }

      if (wasAtBottom) {
        state.scrollOffset = state.entries.length - 1
      }
    },

    scrollDown(state) {
      state.scrollOffset = Math.min(state.scrollOffset + 1, Math.max(0, state.entries.length - 1))
    },

    scrollUp(state) {
      state.scrollOffset = Math.max(0, state.scrollOffset - 1)
    },

    scrollPageDown(state, action: PayloadAction<number>) {
      const pageSize = action.payload
      state.scrollOffset = Math.min(state.scrollOffset + pageSize, Math.max(0, state.entries.length - 1))
    },

    scrollPageUp(state, action: PayloadAction<number>) {
      const pageSize = action.payload
      state.scrollOffset = Math.max(0, state.scrollOffset - pageSize)
    },

    jumpToBottom(state) {
      state.scrollOffset = Math.max(0, state.entries.length - 1)
    },

    clearLogs(state) {
      state.entries = []
      state.scrollOffset = 0
    },
  },
})

export const logsActions = logsSlice.actions
