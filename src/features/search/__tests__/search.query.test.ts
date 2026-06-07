import { describe, expect, it } from "bun:test"
import { searchSlice, searchActions } from "../search.slice"
import type { SearchState } from "../search.types"

const initialState: SearchState = searchSlice.getInitialState()

describe("search query input", () => {
  it("appends a space character to the query via setQuery", () => {
    const state = searchSlice.reducer(
      { ...initialState, query: "hello" },
      searchActions.setQuery("hello "),
    )
    expect(state.query).toBe("hello ")
  })

  it("supports multi-word queries with spaces", () => {
    const state = searchSlice.reducer(
      { ...initialState, query: "nujabes" },
      searchActions.setQuery("nujabes feather"),
    )
    expect(state.query).toBe("nujabes feather")
  })

  it("handles space as the only character", () => {
    const state = searchSlice.reducer(
      { ...initialState, query: "" },
      searchActions.setQuery(" "),
    )
    expect(state.query).toBe(" ")
  })
})
