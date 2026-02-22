import { describe, expect, it } from "bun:test"
import { formatStatusMessage, resolveStatusTextColor } from "../statusline.helpers"

describe("formatStatusMessage", () => {
  it("returns null when status message is null", () => {
    expect(formatStatusMessage(null, "info")).toBeNull()
  })

  it("keeps raw message when no level is available", () => {
    expect(formatStatusMessage("ERR: sample", null)).toBe("ERR: sample")
  })

  it("normalizes prefixed message to colon style", () => {
    expect(formatStatusMessage("ERR: provider failed", "err")).toBe("ERR: provider failed")
  })

  it("adds level prefix when missing", () => {
    expect(formatStatusMessage("paused", "ok")).toBe("OK: paused")
  })
})

describe("resolveStatusTextColor", () => {
  const theme = {
    bg: "#000000",
    panel: "#111111",
    panelAlt: "#222222",
    text: "#ffffff",
    muted: "#aaaaaa",
    accent: "#33ccff",
    border: "#444444",
    status: "#101010",
    statusText: "#f0f0f0",
    selectedBg: "#333333",
    statusInfoText: "#f0f0f0",
    statusOkText: "#66cc66",
    statusErrText: "#ff6666",
  }

  it("uses semantic info color", () => {
    expect(resolveStatusTextColor(theme, "info")).toBe("#f0f0f0")
  })

  it("uses semantic ok color", () => {
    expect(resolveStatusTextColor(theme, "ok")).toBe("#66cc66")
  })

  it("uses semantic err color", () => {
    expect(resolveStatusTextColor(theme, "err")).toBe("#ff6666")
  })

  it("falls back to neutral status color when level is null", () => {
    expect(resolveStatusTextColor(theme, null)).toBe("#f0f0f0")
  })
})
