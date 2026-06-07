import { describe, expect, it, mock, beforeEach } from "bun:test"

const VALID_TOKENS = {
  bg: "#1a1a1a",
  panel: "#222",
  panelAlt: "#2a2a2a",
  text: "#eee",
  muted: "#999",
  accent: "#0af",
  border: "#444",
  status: "#222",
  statusText: "#eee",
  selectedBg: "#333",
}

const VALID_DEFINITION = {
  id: "my-theme",
  description: "A user theme",
  tokens: VALID_TOKENS,
}

// We test validateThemeDefinition indirectly via loadUserThemes by mocking fs
// For unit coverage of validation logic, we re-export it via a test shim approach.
// Instead, we test the full async flow by mocking node:fs/promises.

let mockReaddirImpl: (() => Promise<unknown>) | null = null
let mockReadFileImpl: ((path: string) => Promise<string>) | null = null

mock.module("node:fs/promises", () => ({
  readdir: (...args: unknown[]) => (mockReaddirImpl ? mockReaddirImpl() : Promise.resolve([])),
  readFile: (path: string, ...args: unknown[]) =>
    mockReadFileImpl ? mockReadFileImpl(path) : Promise.reject(new Error("not found")),
}))

// Import after mocking so the module picks up the mock
const { loadUserThemes } = await import("../theme-loader")

describe("loadUserThemes — directory scan", () => {
  beforeEach(() => {
    mockReaddirImpl = null
    mockReadFileImpl = null
  })

  it("returns [] when themes dir does not exist", async () => {
    mockReaddirImpl = () => Promise.reject(new Error("ENOENT"))
    const results = await loadUserThemes(new Set())
    expect(results).toEqual([])
  })

  it("returns [] when themes dir is empty", async () => {
    mockReaddirImpl = () => Promise.resolve([])
    const results = await loadUserThemes(new Set())
    expect(results).toEqual([])
  })

  it("ignores non-.json files", async () => {
    mockReaddirImpl = () =>
      Promise.resolve([
        { isFile: () => true, name: "theme.txt" },
        { isFile: () => true, name: "README.md" },
        { isFile: () => false, name: "somedir" },
      ])
    const results = await loadUserThemes(new Set())
    expect(results).toEqual([])
  })

  it("loads a valid theme file", async () => {
    mockReaddirImpl = () =>
      Promise.resolve([{ isFile: () => true, name: "my-theme.json" }])
    mockReadFileImpl = () => Promise.resolve(JSON.stringify(VALID_DEFINITION))

    const results = await loadUserThemes(new Set())
    expect(results).toHaveLength(1)
    expect(results[0].definition?.id).toBe("my-theme")
    expect(results[0].definition?.tokens.bg).toBe("#1a1a1a")
    expect(results[0].error).toBeUndefined()
  })

  it("passes through optional semantic tokens when present", async () => {
    const withSemantics = {
      ...VALID_DEFINITION,
      tokens: { ...VALID_TOKENS, statusInfoText: "#fff", statusOkText: "#0f0", statusErrText: "#f00" },
    }
    mockReaddirImpl = () =>
      Promise.resolve([{ isFile: () => true, name: "full-theme.json" }])
    mockReadFileImpl = () => Promise.resolve(JSON.stringify(withSemantics))

    const results = await loadUserThemes(new Set())
    expect(results[0].definition?.tokens.statusOkText).toBe("#0f0")
  })
})

describe("loadUserThemes — validation errors", () => {
  beforeEach(() => {
    mockReaddirImpl = () =>
      Promise.resolve([{ isFile: () => true, name: "bad.json" }])
  })

  it("records error for invalid JSON", async () => {
    mockReadFileImpl = () => Promise.resolve("{ not valid json }")
    const results = await loadUserThemes(new Set())
    expect(results[0].definition).toBeUndefined()
    expect(results[0].error).toBeTruthy()
  })

  it("records error for missing id", async () => {
    const { id: _id, ...noId } = VALID_DEFINITION
    mockReadFileImpl = () => Promise.resolve(JSON.stringify(noId))
    const results = await loadUserThemes(new Set())
    expect(results[0].error).toMatch(/id/)
  })

  it("records error for missing description", async () => {
    const { description: _d, ...noDesc } = VALID_DEFINITION
    mockReadFileImpl = () => Promise.resolve(JSON.stringify(noDesc))
    const results = await loadUserThemes(new Set())
    expect(results[0].error).toMatch(/description/)
  })

  it("records error for missing tokens object", async () => {
    mockReadFileImpl = () =>
      Promise.resolve(JSON.stringify({ id: "x", description: "x" }))
    const results = await loadUserThemes(new Set())
    expect(results[0].error).toMatch(/tokens/)
  })

  it("records error when a required base token is missing", async () => {
    const { bg: _bg, ...noBase } = VALID_TOKENS
    mockReadFileImpl = () =>
      Promise.resolve(JSON.stringify({ ...VALID_DEFINITION, tokens: noBase }))
    const results = await loadUserThemes(new Set())
    expect(results[0].error).toMatch(/bg/)
  })

  it("records error when a required base token is an empty string", async () => {
    mockReadFileImpl = () =>
      Promise.resolve(JSON.stringify({ ...VALID_DEFINITION, tokens: { ...VALID_TOKENS, accent: "" } }))
    const results = await loadUserThemes(new Set())
    expect(results[0].error).toMatch(/accent/)
  })
})

describe("loadUserThemes — builtin id collision", () => {
  it("records error when theme id conflicts with a built-in", async () => {
    mockReaddirImpl = () =>
      Promise.resolve([{ isFile: () => true, name: "gruvbox.json" }])
    mockReadFileImpl = () =>
      Promise.resolve(JSON.stringify({ ...VALID_DEFINITION, id: "gruvbox" }))

    const results = await loadUserThemes(new Set(["gruvbox", "nord"]))
    expect(results[0].definition).toBeUndefined()
    expect(results[0].error).toMatch(/conflicts/)
  })

  it("loads a theme whose id does not conflict", async () => {
    mockReaddirImpl = () =>
      Promise.resolve([{ isFile: () => true, name: "custom.json" }])
    mockReadFileImpl = () =>
      Promise.resolve(JSON.stringify({ ...VALID_DEFINITION, id: "custom" }))

    const results = await loadUserThemes(new Set(["gruvbox", "nord"]))
    expect(results[0].definition?.id).toBe("custom")
  })

  it("processes multiple files and returns independent results", async () => {
    let callCount = 0
    mockReaddirImpl = () =>
      Promise.resolve([
        { isFile: () => true, name: "good.json" },
        { isFile: () => true, name: "bad.json" },
      ])
    mockReadFileImpl = () => {
      callCount++
      if (callCount === 1) return Promise.resolve(JSON.stringify({ ...VALID_DEFINITION, id: "custom-good" }))
      return Promise.resolve("broken json}")
    }

    const results = await loadUserThemes(new Set())
    expect(results).toHaveLength(2)
    expect(results.some((r) => r.definition?.id === "custom-good")).toBe(true)
    expect(results.some((r) => r.error)).toBe(true)
  })
})
