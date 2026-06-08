import { describe, expect, it } from "bun:test"
import { uiSlice, uiActions } from "../ui.slice"

const { reducer } = uiSlice
const base = reducer(undefined, { type: "@@init" })

describe("ui slice — settings category navigation", () => {
  it("moveSettingsCategoryNext increments index", () => {
    const state = reducer(base, uiActions.moveSettingsCategoryNext(5))
    expect(state.settingsCategoryIndex).toBe(1)
  })

  it("moveSettingsCategoryNext wraps around at last index", () => {
    let state = base
    for (let i = 0; i < 5; i++) {
      state = reducer(state, uiActions.moveSettingsCategoryNext(5))
    }
    expect(state.settingsCategoryIndex).toBe(0)
  })

  it("moveSettingsCategoryNext resets settingsItemIndex", () => {
    const withItem = reducer(base, uiActions.moveSettingsItemDown(5))
    expect(withItem.settingsItemIndex).toBe(1)
    const moved = reducer(withItem, uiActions.moveSettingsCategoryNext(5))
    expect(moved.settingsItemIndex).toBe(0)
  })

  it("moveSettingsCategoryPrev decrements index", () => {
    const at2 = reducer(
      reducer(base, uiActions.moveSettingsCategoryNext(5)),
      uiActions.moveSettingsCategoryNext(5),
    )
    const state = reducer(at2, uiActions.moveSettingsCategoryPrev(5))
    expect(state.settingsCategoryIndex).toBe(1)
  })

  it("moveSettingsCategoryPrev wraps around at index 0", () => {
    const state = reducer(base, uiActions.moveSettingsCategoryPrev(5))
    expect(state.settingsCategoryIndex).toBe(4)
  })

  it("moveSettingsCategoryPrev resets settingsItemIndex", () => {
    const withItem = reducer(base, uiActions.moveSettingsItemDown(5))
    const moved = reducer(withItem, uiActions.moveSettingsCategoryPrev(5))
    expect(moved.settingsItemIndex).toBe(0)
  })
})

describe("ui slice — settings item navigation", () => {
  it("moveSettingsItemDown increments item index", () => {
    const state = reducer(base, uiActions.moveSettingsItemDown(5))
    expect(state.settingsItemIndex).toBe(1)
  })

  it("moveSettingsItemDown clamps at last index", () => {
    let state = base
    for (let i = 0; i < 10; i++) {
      state = reducer(state, uiActions.moveSettingsItemDown(3))
    }
    expect(state.settingsItemIndex).toBe(2)
  })

  it("moveSettingsItemUp decrements item index", () => {
    const at1 = reducer(base, uiActions.moveSettingsItemDown(5))
    const state = reducer(at1, uiActions.moveSettingsItemUp())
    expect(state.settingsItemIndex).toBe(0)
  })

  it("moveSettingsItemUp clamps at 0", () => {
    const state = reducer(base, uiActions.moveSettingsItemUp())
    expect(state.settingsItemIndex).toBe(0)
  })
})

describe("ui slice — resetSettingsNavigation", () => {
  it("resets category and item indices", () => {
    let state = base
    state = reducer(state, uiActions.moveSettingsCategoryNext(5))
    state = reducer(state, uiActions.moveSettingsItemDown(5))
    state = reducer(state, uiActions.resetSettingsNavigation())
    expect(state.settingsCategoryIndex).toBe(0)
    expect(state.settingsItemIndex).toBe(0)
  })
})

describe("ui slice — cycleMode includes settings", () => {
  it("cycles through settings mode", () => {
    let state = reducer(base, uiActions.setMode("normal"))
    const modes: string[] = [state.mode]
    for (let i = 0; i < 6; i++) {
      state = reducer(state, uiActions.cycleMode())
      modes.push(state.mode)
    }
    expect(modes).toContain("settings")
    expect(modes[modes.length - 1]).toBe("normal")
  })
})
