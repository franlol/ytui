import { describe, expect, it } from "bun:test"

function clampIndex(selectedIndex: number, themeCount: number): number {
  return Math.max(0, Math.min(selectedIndex, Math.max(0, themeCount - 1)))
}

describe("ThemePicker selectedIndex clamping", () => {
  it("clamps negative index to 0", () => {
    expect(clampIndex(-1, 4)).toBe(0)
  })

  it("clamps index beyond last item to last item", () => {
    expect(clampIndex(10, 4)).toBe(3)
  })

  it("passes a valid mid-range index through unchanged", () => {
    expect(clampIndex(2, 4)).toBe(2)
  })

  it("handles a single-item list without going negative", () => {
    expect(clampIndex(0, 1)).toBe(0)
  })

  it("clamps to 0 for an empty list", () => {
    expect(clampIndex(5, 0)).toBe(0)
  })
})
