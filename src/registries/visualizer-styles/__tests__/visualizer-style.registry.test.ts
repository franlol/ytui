import { describe, expect, it } from "bun:test"
import { createDefaultVisualizerStyleRegistry, VisualizerStyleRegistry } from "../visualizer-style.registry"

describe("visualizer style registry", () => {
  it("provides built-in style definitions", () => {
    const registry = createDefaultVisualizerStyleRegistry()
    const ids = registry.list().map((item) => item.id)

    expect(ids.includes("blocks")).toBe(true)
    expect(ids.includes("ascii")).toBe(true)
  })

  it("falls back to blocks for unknown style", () => {
    const registry = createDefaultVisualizerStyleRegistry()
    const style = registry.getOrFallback("missing")

    expect(style.id).toBe("blocks")
  })

  it("normalizes invalid ramps", () => {
    const registry = new VisualizerStyleRegistry()
    registry.register({ id: "custom", label: "Custom", description: "x", ramp: [] })

    const style = registry.getOrFallback("custom")
    expect(style.ramp.length).toBe(2)
    expect(style.ramp[1]).toBe("#")
  })
})
