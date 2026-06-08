import { describe, expect, it } from "bun:test"
import { logsActions, logsSlice } from "../logs.slice"
import type { LogsState } from "../logs.slice.types"

const reducer = logsSlice.reducer

const BASE: LogsState = {
  entries: [],
  scrollOffset: 0,
  maxEntries: 500,
}

describe("logs reducer", () => {
  it("adds an entry with correct shape", () => {
    const state = reducer(BASE, logsActions.addEntry({ level: "info", source: "test", message: "hello" }))
    expect(state.entries).toHaveLength(1)
    expect(state.entries[0]).toMatchObject({ level: "info", source: "test", message: "hello" })
    expect(typeof state.entries[0].id).toBe("string")
    expect(typeof state.entries[0].timestamp).toBe("number")
  })

  it("auto-advances scrollOffset when at bottom (follow mode)", () => {
    let state = reducer(BASE, logsActions.addEntry({ level: "info", source: "a", message: "1" }))
    expect(state.scrollOffset).toBe(0)
    state = reducer(state, logsActions.addEntry({ level: "info", source: "a", message: "2" }))
    expect(state.scrollOffset).toBe(1)
    state = reducer(state, logsActions.addEntry({ level: "info", source: "a", message: "3" }))
    expect(state.scrollOffset).toBe(2)
  })

  it("does not advance scrollOffset when user has scrolled up", () => {
    let state = reducer(BASE, logsActions.addEntry({ level: "info", source: "a", message: "1" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "a", message: "2" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "a", message: "3" }))
    // User scrolls up
    state = reducer(state, logsActions.scrollUp())
    const offsetBeforeNewEntry = state.scrollOffset
    // New entry arrives — offset should NOT advance
    state = reducer(state, logsActions.addEntry({ level: "info", source: "a", message: "4" }))
    expect(state.scrollOffset).toBe(offsetBeforeNewEntry)
  })

  it("enforces ring buffer cap and adjusts scrollOffset", () => {
    const cap: LogsState = { ...BASE, maxEntries: 3 }
    let state = reducer(cap, logsActions.addEntry({ level: "info", source: "x", message: "1" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "x", message: "2" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "x", message: "3" }))
    expect(state.entries).toHaveLength(3)
    // Adding a 4th entry should drop the oldest
    state = reducer(state, logsActions.addEntry({ level: "info", source: "x", message: "4" }))
    expect(state.entries).toHaveLength(3)
    expect(state.entries[0].message).toBe("2")
    expect(state.entries[2].message).toBe("4")
  })

  it("scrollDown increments scrollOffset, capped at last entry", () => {
    let state = reducer(BASE, logsActions.addEntry({ level: "info", source: "x", message: "1" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "x", message: "2" }))
    state = reducer(state, logsActions.scrollUp())
    expect(state.scrollOffset).toBe(0)
    state = reducer(state, logsActions.scrollDown())
    expect(state.scrollOffset).toBe(1)
    state = reducer(state, logsActions.scrollDown())
    expect(state.scrollOffset).toBe(1)
  })

  it("scrollUp decrements scrollOffset, floored at 0", () => {
    const state = reducer(BASE, logsActions.scrollUp())
    expect(state.scrollOffset).toBe(0)
  })

  it("jumpToBottom moves scrollOffset to last entry", () => {
    let state = reducer(BASE, logsActions.addEntry({ level: "info", source: "x", message: "1" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "x", message: "2" }))
    state = reducer(state, logsActions.addEntry({ level: "info", source: "x", message: "3" }))
    state = reducer(state, logsActions.scrollUp())
    state = reducer(state, logsActions.scrollUp())
    expect(state.scrollOffset).toBe(0)
    state = reducer(state, logsActions.jumpToBottom())
    expect(state.scrollOffset).toBe(2)
  })

  it("clearLogs empties entries and resets scrollOffset", () => {
    let state = reducer(BASE, logsActions.addEntry({ level: "error", source: "x", message: "boom" }))
    state = reducer(state, logsActions.clearLogs())
    expect(state.entries).toHaveLength(0)
    expect(state.scrollOffset).toBe(0)
  })

  it("scrollPageDown advances by page size", () => {
    let state: LogsState = { ...BASE, scrollOffset: 0 }
    for (let i = 0; i < 20; i++) {
      state = reducer(state, logsActions.addEntry({ level: "debug", source: "x", message: String(i) }))
    }
    state = reducer(state, logsActions.scrollUp()) // move off bottom
    state = { ...state, scrollOffset: 5 }
    state = reducer(state, logsActions.scrollPageDown(5))
    expect(state.scrollOffset).toBe(10)
  })

  it("scrollPageUp retreats by page size", () => {
    let state: LogsState = { ...BASE, scrollOffset: 10 }
    state = reducer(state, logsActions.scrollPageUp(5))
    expect(state.scrollOffset).toBe(5)
    state = reducer(state, logsActions.scrollPageUp(10))
    expect(state.scrollOffset).toBe(0)
  })
})
