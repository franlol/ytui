import { describe, expect, it } from "bun:test"
import { parseCommandInput } from "../command-parser"

describe("parseCommandInput", () => {
  it("returns null for empty input", () => {
    expect(parseCommandInput("")).toBeNull()
    expect(parseCommandInput("   ")).toBeNull()
  })

  it("parses a bare command with no args", () => {
    expect(parseCommandInput("q")).toEqual({ name: "q", args: [] })
  })

  it("parses simple space-separated args", () => {
    expect(parseCommandInput("playlist new Chill")).toEqual({ name: "playlist", args: ["new", "Chill"] })
  })

  it("parses multiple unquoted args", () => {
    expect(parseCommandInput("theme pick gruvbox")).toEqual({ name: "theme", args: ["pick", "gruvbox"] })
  })

  it("parses a quoted arg as a single token", () => {
    expect(parseCommandInput('playlist new "Summer Hits"')).toEqual({ name: "playlist", args: ["new", "Summer Hits"] })
  })

  it("parses rename with two quoted args", () => {
    expect(parseCommandInput('playlist rename "Summer Hits" "New Name"')).toEqual({
      name: "playlist",
      args: ["rename", "Summer Hits", "New Name"],
    })
  })

  it("parses rename with first quoted and second unquoted", () => {
    expect(parseCommandInput('playlist rename "Summer Hits" Chill')).toEqual({
      name: "playlist",
      args: ["rename", "Summer Hits", "Chill"],
    })
  })

  it("handles unclosed quote by consuming to end of input", () => {
    expect(parseCommandInput('playlist new "Summer Hits')).toEqual({ name: "playlist", args: ["new", "Summer Hits"] })
  })

  it("handles empty quoted string", () => {
    expect(parseCommandInput('cmd ""')).toEqual({ name: "cmd", args: [""] })
  })
})
