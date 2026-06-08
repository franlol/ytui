import { describe, expect, it } from "bun:test"
import { settingsSlice, settingsActions } from "../settings.slice"

const { reducer } = settingsSlice
const base = reducer(undefined, { type: "@@init" })

describe("settings slice — new actions", () => {
  it("setCavaEnabled sets cavaEnabled to false", () => {
    const state = reducer(base, settingsActions.setCavaEnabled(false))
    expect(state.cavaEnabled).toBe(false)
  })

  it("setCavaEnabled sets cavaEnabled to true", () => {
    const off = reducer(base, settingsActions.setCavaEnabled(false))
    const state = reducer(off, settingsActions.setCavaEnabled(true))
    expect(state.cavaEnabled).toBe(true)
  })

  it("setCavaHeight clamps to min 1", () => {
    const state = reducer(base, settingsActions.setCavaHeight(0))
    expect(state.cavaHeight).toBe(1)
  })

  it("setCavaHeight clamps to max 8", () => {
    const state = reducer(base, settingsActions.setCavaHeight(99))
    expect(state.cavaHeight).toBe(8)
  })

  it("setCavaHeight sets valid value", () => {
    const state = reducer(base, settingsActions.setCavaHeight(5))
    expect(state.cavaHeight).toBe(5)
  })

  it("setResultsLimit clamps to min 10", () => {
    const state = reducer(base, settingsActions.setResultsLimit(5))
    expect(state.resultsLimit).toBe(10)
  })

  it("setResultsLimit clamps to max 100", () => {
    const state = reducer(base, settingsActions.setResultsLimit(999))
    expect(state.resultsLimit).toBe(100)
  })

  it("setResultsLimit sets valid value", () => {
    const state = reducer(base, settingsActions.setResultsLimit(50))
    expect(state.resultsLimit).toBe(50)
  })

  it("setStatusTimeout clamps to min 500", () => {
    const state = reducer(base, settingsActions.setStatusTimeout(100))
    expect(state.statusTimeoutMs).toBe(500)
  })

  it("setStatusTimeout clamps to max 10000", () => {
    const state = reducer(base, settingsActions.setStatusTimeout(99999))
    expect(state.statusTimeoutMs).toBe(10000)
  })

  it("setStatusTimeout sets valid value", () => {
    const state = reducer(base, settingsActions.setStatusTimeout(3000))
    expect(state.statusTimeoutMs).toBe(3000)
  })

  it("setUseAlternateScreen sets to true", () => {
    const state = reducer(base, settingsActions.setUseAlternateScreen(true))
    expect(state.useAlternateScreen).toBe(true)
  })

  it("setUseAlternateScreen sets to false", () => {
    const on = reducer(base, settingsActions.setUseAlternateScreen(true))
    const state = reducer(on, settingsActions.setUseAlternateScreen(false))
    expect(state.useAlternateScreen).toBe(false)
  })
})
