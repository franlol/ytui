import { describe, expect, it } from "bun:test"
import { ThemeRegistry, createDefaultThemeRegistry } from "../theme.registry"

describe("ThemeRegistry — register / get / list", () => {
  it("get returns undefined for an unknown id", () => {
    const registry = new ThemeRegistry()
    expect(registry.get("nonexistent")).toBeUndefined()
  })

  it("get returns the definition after register", () => {
    const registry = new ThemeRegistry()
    registry.register({ id: "test", description: "Test theme", tokens: { bg: "#000", panel: "#000", panelAlt: "#000", text: "#fff", muted: "#aaa", accent: "#0ff", border: "#333", status: "#000", statusText: "#fff", selectedBg: "#222" } })
    expect(registry.get("test")?.id).toBe("test")
  })

  it("list returns all registered themes", () => {
    const registry = createDefaultThemeRegistry()
    const ids = registry.list().map((t) => t.id)
    expect(ids).toContain("gruvbox")
    expect(ids).toContain("nord")
    expect(ids).toContain("matrix")
    expect(ids).toContain("palenight")
  })
})

describe("ThemeRegistry — getTokens", () => {
  it("returns resolved tokens for a known theme id", () => {
    const registry = createDefaultThemeRegistry()
    const tokens = registry.getTokens("gruvbox")
    expect(tokens.bg).toBe("#1d2021")
    expect(tokens.accent).toBe("#fabd2f")
  })

  it("falls back to gruvbox when the requested id is unknown", () => {
    const registry = createDefaultThemeRegistry()
    const tokens = registry.getTokens("does-not-exist")
    expect(tokens.bg).toBe("#1d2021")
  })

  it("falls back to FALLBACK_TOKENS when both id and fallback are unknown", () => {
    const registry = new ThemeRegistry()
    const tokens = registry.getTokens("missing", "also-missing")
    expect(tokens.text).toBe("#ffffff")
  })

  it("resolves missing statusInfoText from statusText", () => {
    const registry = new ThemeRegistry()
    registry.register({ id: "minimal", description: "No semantic tokens", tokens: { bg: "#000", panel: "#000", panelAlt: "#000", text: "#eee", muted: "#aaa", accent: "#0ff", border: "#333", status: "#000", statusText: "#eee", selectedBg: "#222" } })
    const tokens = registry.getTokens("minimal", "minimal")
    expect(tokens.statusInfoText).toBe("#eee")
  })
})
