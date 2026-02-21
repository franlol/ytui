import { describe, expect, it } from "bun:test"
import { parseRawFrame } from "../cava-visualizer.service"

describe("cava visualizer parser", () => {
  it("parses a semicolon-delimited raw frame", () => {
    expect(parseRawFrame("0;2;7;3")).toEqual([0, 2, 7, 3])
  })

  it("filters malformed values", () => {
    expect(parseRawFrame("3;bad;-2;8")).toEqual([3, 8])
  })
})
