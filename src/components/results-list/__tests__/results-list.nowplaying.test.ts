import { describe, expect, it } from "bun:test"

function buildName(title: string, isPlaying: boolean, widthCols: number): string {
  const maxWidth = widthCols - 3
  if (!isPlaying) return title.slice(0, maxWidth)
  return title.slice(0, maxWidth - 1).padEnd(maxWidth - 1) + "◆"
}

describe("ResultsList buildName — now-playing indicator", () => {
  it("appends ◆ at the rightmost position for the now-playing track", () => {
    expect(buildName("Alpha", true, 20)).toEndWith("◆")
  })

  it("total length equals widthCols - 3 when playing", () => {
    expect(buildName("Alpha", true, 20).length).toBe(17)
  })

  it("pads a short title with spaces before ◆", () => {
    expect(buildName("Hi", true, 20)).toBe("Hi              ◆")
  })

  it("truncates a long title to fit ◆ at the end", () => {
    const result = buildName("A very long title that overflows", true, 20)
    expect(result.length).toBe(17)
    expect(result.endsWith("◆")).toBe(true)
  })

  it("does not append ◆ for non-playing tracks", () => {
    expect(buildName("Alpha", false, 20)).not.toContain("◆")
    expect(buildName("Alpha", false, 20)).toBe("Alpha")
  })

  it("plain name is truncated to widthCols - 3 when too long", () => {
    const result = buildName("A very long title that overflows", false, 20)
    expect(result.length).toBeLessThanOrEqual(17)
  })

  it("returns plain title unchanged when isPlaying is false and caller passes undefined id", () => {
    expect(buildName("Beta", false, 30)).toBe("Beta")
  })
})
