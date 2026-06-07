import { describe, expect, it } from "bun:test"
import { clampThemeIndex } from "../theme-picker.helpers"

describe("clampThemeIndex", () => {
  it("clamps negative index to 0", () => {
    expect(clampThemeIndex(-1, 4)).toBe(0)
  })

  it("clamps index beyond last item to last item", () => {
    expect(clampThemeIndex(10, 4)).toBe(3)
  })

  it("passes a valid mid-range index through unchanged", () => {
    expect(clampThemeIndex(2, 4)).toBe(2)
  })

  it("handles a single-item list without going negative", () => {
    expect(clampThemeIndex(0, 1)).toBe(0)
  })

  it("clamps to 0 for an empty list", () => {
    expect(clampThemeIndex(5, 0)).toBe(0)
  })
})
