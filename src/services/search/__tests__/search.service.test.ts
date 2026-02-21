import { describe, expect, it } from "bun:test"
import { formatDuration, parseYtDlpLine } from "../search.service"

describe("search.service parser", () => {
  it("parses a valid yt-dlp json line", () => {
    const input = JSON.stringify({
      id: "abc123",
      title: "Test Track",
      duration: 125,
      uploader: "Test Channel",
    })

    const parsed = parseYtDlpLine(input)

    expect(parsed).not.toBeNull()
    expect(parsed?.id).toBe("abc123")
    expect(parsed?.title).toBe("Test Track")
    expect(parsed?.author).toBe("Test Channel")
    expect(parsed?.durationSec).toBe(125)
    expect(parsed?.durationLabel).toBe("02:05")
  })

  it("returns null for malformed line", () => {
    expect(parseYtDlpLine("not-json")).toBeNull()
  })

  it("returns null when id/title missing", () => {
    expect(parseYtDlpLine(JSON.stringify({ title: "No id" }))).toBeNull()
    expect(parseYtDlpLine(JSON.stringify({ id: "x" }))).toBeNull()
  })
})

describe("formatDuration", () => {
  it("formats minutes and seconds", () => {
    expect(formatDuration(0)).toBe("00:00")
    expect(formatDuration(9)).toBe("00:09")
    expect(formatDuration(61)).toBe("01:01")
  })
})
