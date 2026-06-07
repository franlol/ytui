import { describe, expect, it } from "bun:test"
import { computeModalPosition, resolveModalHeight, resolveModalWidth } from "../modal.helpers"

describe("resolveModalWidth", () => {
  it("returns explicit width when no fraction given", () => {
    expect(resolveModalWidth({ width: 60, screenWidth: 120 })).toBe(60)
  })

  it("computes fraction of screenWidth", () => {
    expect(resolveModalWidth({ widthFraction: 0.68, screenWidth: 100 })).toBe(68)
  })

  it("applies minWidth floor when fraction result is too small", () => {
    expect(resolveModalWidth({ widthFraction: 0.1, minWidth: 48, screenWidth: 100 })).toBe(48)
  })

  it("does not apply minWidth when result already exceeds it", () => {
    expect(resolveModalWidth({ widthFraction: 0.8, minWidth: 48, screenWidth: 100 })).toBe(80)
  })
})

describe("resolveModalHeight", () => {
  it("returns explicit height when given", () => {
    expect(resolveModalHeight({ height: 20, screenHeight: 40 })).toBe(20)
  })

  it("computes fraction of screenHeight", () => {
    expect(resolveModalHeight({ heightFraction: 0.6, screenHeight: 40 })).toBe(24)
  })

  it("returns undefined when neither height nor fraction is given", () => {
    expect(resolveModalHeight({ screenHeight: 40 })).toBeUndefined()
  })

  it("explicit height takes precedence over fraction", () => {
    expect(resolveModalHeight({ height: 10, heightFraction: 0.6, screenHeight: 40 })).toBe(10)
  })
})

describe("computeModalPosition", () => {
  it("centers horizontally and vertically for centered strategy", () => {
    const pos = computeModalPosition({
      positioning: { strategy: "centered" },
      screenWidth: 120,
      screenHeight: 40,
      finalWidth: 60,
      finalHeight: 20,
    })
    expect(pos.left).toBe(30)
    expect(pos.top).toBe(10)
  })

  it("uses given top for top-anchored strategy", () => {
    const pos = computeModalPosition({
      positioning: { strategy: "top-anchored", top: 2 },
      screenWidth: 120,
      screenHeight: 40,
      finalWidth: 60,
    })
    expect(pos.top).toBe(2)
    expect(pos.left).toBe(30)
  })

  it("clamps top to 0 when modal is taller than screen", () => {
    const pos = computeModalPosition({
      positioning: { strategy: "centered" },
      screenWidth: 120,
      screenHeight: 10,
      finalWidth: 60,
      finalHeight: 40,
    })
    expect(pos.top).toBe(0)
  })
})
