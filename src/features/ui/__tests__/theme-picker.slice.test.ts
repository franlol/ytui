import { describe, expect, it } from "bun:test"
import { uiSlice, uiActions } from "../ui.slice"

const { reducer } = uiSlice

const base = reducer(undefined, { type: "@@init" })

describe("ui slice — theme picker actions", () => {
  it("openThemePicker sets open flag, index, and previousId", () => {
    const state = reducer(base, uiActions.openThemePicker({ selectedIndex: 2, previousId: "gruvbox" }))
    expect(state.themePickerOpen).toBe(true)
    expect(state.themePickerSelectedIndex).toBe(2)
    expect(state.themePickerPreviousId).toBe("gruvbox")
  })

  it("closeThemePicker sets open flag to false", () => {
    const opened = reducer(base, uiActions.openThemePicker({ selectedIndex: 1, previousId: "nord" }))
    const closed = reducer(opened, uiActions.closeThemePicker())
    expect(closed.themePickerOpen).toBe(false)
  })

  it("moveThemePickerDown increments index", () => {
    const opened = reducer(base, uiActions.openThemePicker({ selectedIndex: 0, previousId: "gruvbox" }))
    const moved = reducer(opened, uiActions.moveThemePickerDown(4))
    expect(moved.themePickerSelectedIndex).toBe(1)
  })

  it("moveThemePickerDown clamps at last index", () => {
    const opened = reducer(base, uiActions.openThemePicker({ selectedIndex: 3, previousId: "gruvbox" }))
    const moved = reducer(opened, uiActions.moveThemePickerDown(4))
    expect(moved.themePickerSelectedIndex).toBe(3)
  })

  it("moveThemePickerUp decrements index", () => {
    const opened = reducer(base, uiActions.openThemePicker({ selectedIndex: 2, previousId: "gruvbox" }))
    const moved = reducer(opened, uiActions.moveThemePickerUp())
    expect(moved.themePickerSelectedIndex).toBe(1)
  })

  it("moveThemePickerUp clamps at 0", () => {
    const opened = reducer(base, uiActions.openThemePicker({ selectedIndex: 0, previousId: "gruvbox" }))
    const moved = reducer(opened, uiActions.moveThemePickerUp())
    expect(moved.themePickerSelectedIndex).toBe(0)
  })
})
