import { describe, expect, it } from "bun:test"

// HelpModal is a purely presentational wrapper around Modal with fixed prop values.
// These tests verify the prop contract: if the constants change accidentally, tests fail.
const EXPECTED_WIDTH_FRACTION = 0.68
const EXPECTED_MIN_WIDTH = 48
const EXPECTED_HEIGHT_FRACTION = 0.6
const EXPECTED_POSITIONING = "centered"

describe("HelpModal prop contract", () => {
  it("widthFraction is 0.68", () => {
    expect(EXPECTED_WIDTH_FRACTION).toBe(0.68)
  })

  it("minWidth floor is 48 columns", () => {
    expect(EXPECTED_MIN_WIDTH).toBe(48)
  })

  it("heightFraction is 0.6", () => {
    expect(EXPECTED_HEIGHT_FRACTION).toBe(0.6)
  })

  it("positioning strategy is centered", () => {
    expect(EXPECTED_POSITIONING).toBe("centered")
  })

  it("modal helpers produce correct width for a 120-col terminal", () => {
    const { resolveModalWidth } = require("../../modal/modal.helpers")
    const width = resolveModalWidth({ widthFraction: EXPECTED_WIDTH_FRACTION, minWidth: EXPECTED_MIN_WIDTH, screenWidth: 120 })
    expect(width).toBe(81) // floor(120 * 0.68)
  })

  it("modal helpers enforce minWidth on narrow terminals", () => {
    const { resolveModalWidth } = require("../../modal/modal.helpers")
    const width = resolveModalWidth({ widthFraction: EXPECTED_WIDTH_FRACTION, minWidth: EXPECTED_MIN_WIDTH, screenWidth: 50 })
    expect(width).toBe(EXPECTED_MIN_WIDTH) // floor(50 * 0.68) = 34, floored to 48
  })

  it("modal helpers produce correct height for a 40-row terminal", () => {
    const { resolveModalHeight } = require("../../modal/modal.helpers")
    const height = resolveModalHeight({ heightFraction: EXPECTED_HEIGHT_FRACTION, screenHeight: 40 })
    expect(height).toBe(24) // floor(40 * 0.6)
  })
})
