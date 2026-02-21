import { describe, expect, it } from "bun:test"
import { composeLeftStatusRight } from "../text"

describe("composeLeftStatusRight", () => {
  it("keeps mode on left and metrics on right", () => {
    const line = composeLeftStatusRight("-- NORMAL --", "OK: paused", "q:3 vol:72% sb:on", 60)

    expect(line.startsWith("-- NORMAL --")).toBe(true)
    expect(line.includes("-- NORMAL --  OK: paused")).toBe(true)
    expect(line.endsWith("q:3 vol:72% sb:on")).toBe(true)
    expect(line.includes("OK: paused")).toBe(true)
  })

  it("falls back safely on narrow widths", () => {
    const line = composeLeftStatusRight("-- SEARCH --", "ERR: sample message", "q:12 vol:55% sb:off", 24)

    expect(line.includes("q:12")).toBe(true)
    expect(line.length).toBeGreaterThan(0)
  })
})
