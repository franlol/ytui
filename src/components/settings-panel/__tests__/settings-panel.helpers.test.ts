import { describe, expect, it, mock } from "bun:test"
import { buildCategoryDisplayItems, buildCategoryItems, SETTINGS_CATEGORIES } from "../settings-panel.helpers"
import type { RootState } from "../../../state/store/store.types"

// Minimal state stub for helpers tests
function makeState(overrides: Partial<RootState["settings"]> = {}, uiOverrides: Partial<RootState["ui"]> = {}): RootState {
  return {
    settings: {
      themeId: "gruvbox",
      progressStyleId: "blocks",
      cavaStyleId: "blocks",
      cavaSourceMode: "ytui-strict",
      resultsLimit: 20,
      cavaEnabled: true,
      cavaHeight: 2,
      statusTimeoutMs: 2200,
      useAlternateScreen: false,
      defaultMode: "normal",
      ...overrides,
    },
    ui: {
      mode: "settings",
      sidebarCollapsed: false,
      commandActive: false,
      commandBuffer: "",
      helpOpen: false,
      themePickerOpen: false,
      themePickerSelectedIndex: 0,
      themePickerPreviousId: "",
      playlistPickerOpen: false,
      playlistPickerSelectedIndex: 0,
      statusMessage: null,
      statusLevel: null,
      settingsCategoryIndex: 0,
      settingsItemIndex: 0,
      ...uiOverrides,
    },
    provider: { activeProviderId: "youtube", available: [] },
    plugins: { installed: [] },
  } as unknown as RootState
}

function makeRegistries() {
  return {
    themeRegistry: {
      list: () => [
        { id: "gruvbox", description: "Warm retro", tokens: {} },
        { id: "nord", description: "Cool blue", tokens: {} },
        { id: "matrix", description: "Hacker", tokens: {} },
      ],
    },
    progressStyleRegistry: {
      list: () => [{ id: "blocks" }, { id: "dots" }, { id: "braille" }],
    },
    visualizerStyleRegistry: {
      list: () => [{ id: "blocks" }, { id: "ascii" }],
    },
  } as never
}

describe("SETTINGS_CATEGORIES", () => {
  it("contains all five categories in order", () => {
    const ids = SETTINGS_CATEGORIES.map((c) => c.id)
    expect(ids).toEqual(["appearance", "visualizer", "behavior", "providers", "plugins"])
  })
})

describe("buildCategoryDisplayItems — appearance", () => {
  it("returns theme and progress style rows", () => {
    const items = buildCategoryDisplayItems("appearance", makeState(), makeRegistries())
    expect(items).toHaveLength(2)
    expect(items[0]?.name).toContain("Theme")
    expect(items[0]?.name).toContain("gruvbox")
    expect(items[1]?.name).toContain("Progress Style")
    expect(items[1]?.name).toContain("blocks")
  })
})

describe("buildCategoryDisplayItems — visualizer", () => {
  it("returns four rows", () => {
    const items = buildCategoryDisplayItems("visualizer", makeState(), makeRegistries())
    expect(items).toHaveLength(4)
  })

  it("reflects cavaEnabled state", () => {
    const items = buildCategoryDisplayItems("visualizer", makeState({ cavaEnabled: false }), makeRegistries())
    expect(items[0]?.name).toContain("off")
  })
})

describe("buildCategoryDisplayItems — behavior", () => {
  it("returns five rows", () => {
    const items = buildCategoryDisplayItems("behavior", makeState(), makeRegistries())
    expect(items).toHaveLength(5)
  })

  it("reflects sidebar state from ui", () => {
    const items = buildCategoryDisplayItems("behavior", makeState({}, { sidebarCollapsed: true }), makeRegistries())
    const sidebarRow = items.find((i) => i.name.includes("Sidebar"))
    expect(sidebarRow?.name).toContain("off")
  })
})

describe("buildCategoryDisplayItems — providers", () => {
  it("returns placeholder when no providers registered", () => {
    const items = buildCategoryDisplayItems("providers", makeState(), makeRegistries())
    expect(items[0]?.name).toContain("No providers")
  })
})

describe("buildCategoryDisplayItems — plugins", () => {
  it("returns placeholder when no plugins installed", () => {
    const items = buildCategoryDisplayItems("plugins", makeState(), makeRegistries())
    expect(items[0]?.name).toContain("No plugins")
  })
})

describe("buildCategoryItems — onChange dispatches correct action", () => {
  it("theme onChange cycles to next theme", () => {
    const dispatchMock = mock(() => undefined)
    const state = makeState({ themeId: "gruvbox" })
    const descriptors = buildCategoryItems("appearance", state, makeRegistries(), dispatchMock as never)
    descriptors[0]?.onChange?.(dispatchMock as never, 1)
    expect(dispatchMock).toHaveBeenCalledTimes(1)
    const calls = dispatchMock.mock.calls as unknown as [[{ payload: string }]]
    expect(calls[0]?.[0]?.payload).toBe("nord")
  })

  it("theme onChange cycles backwards", () => {
    const dispatchMock = mock(() => undefined)
    const state = makeState({ themeId: "gruvbox" })
    const descriptors = buildCategoryItems("appearance", state, makeRegistries(), dispatchMock as never)
    descriptors[0]?.onChange?.(dispatchMock as never, -1)
    const calls = dispatchMock.mock.calls as unknown as [[{ payload: string }]]
    expect(calls[0]?.[0]?.payload).toBe("matrix")
  })

  it("cavaEnabled onChange toggles boolean", () => {
    const dispatchMock = mock(() => undefined)
    const state = makeState({ cavaEnabled: true })
    const descriptors = buildCategoryItems("visualizer", state, makeRegistries(), dispatchMock as never)
    descriptors[0]?.onChange?.(dispatchMock as never, 1)
    const calls = dispatchMock.mock.calls as unknown as [[{ payload: boolean }]]
    expect(calls[0]?.[0]?.payload).toBe(false)
  })

  it("resultsLimit onChange increments by step 5", () => {
    const dispatchMock = mock(() => undefined)
    const state = makeState({ resultsLimit: 20 })
    const descriptors = buildCategoryItems("behavior", state, makeRegistries(), dispatchMock as never)
    const limitRow = descriptors.find((d) => d.display.name.includes("Results Limit"))
    limitRow?.onChange?.(dispatchMock as never, 1)
    const calls = dispatchMock.mock.calls as unknown as [[{ payload: number }]]
    expect(calls[0]?.[0]?.payload).toBe(25)
  })

  it("resultsLimit onChange decrements by step 5", () => {
    const dispatchMock = mock(() => undefined)
    const state = makeState({ resultsLimit: 20 })
    const descriptors = buildCategoryItems("behavior", state, makeRegistries(), dispatchMock as never)
    const limitRow = descriptors.find((d) => d.display.name.includes("Results Limit"))
    limitRow?.onChange?.(dispatchMock as never, -1)
    const calls = dispatchMock.mock.calls as unknown as [[{ payload: number }]]
    expect(calls[0]?.[0]?.payload).toBe(15)
  })
})
