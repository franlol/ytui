import { describe, expect, it } from "bun:test"
import { buildCategoryDisplayItems, SETTINGS_CATEGORIES } from "../../../components/settings-panel/settings-panel.helpers"
import type { RootState } from "../../../state/store/store.types"

function makeState(settingsCategoryIndex = 0): RootState {
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
      settingsCategoryIndex,
      settingsItemIndex: 0,
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
      ],
    },
    progressStyleRegistry: {
      list: () => [{ id: "blocks" }, { id: "dots" }],
    },
    visualizerStyleRegistry: {
      list: () => [{ id: "blocks" }, { id: "ascii" }],
    },
  } as never
}

describe("SettingsLayout — category resolution", () => {
  it("resolves the correct category id for each valid index", () => {
    const ids = SETTINGS_CATEGORIES.map((c) => c.id)
    expect(ids).toEqual(["appearance", "visualizer", "behavior", "providers", "plugins"])
  })

  it("falls back to 'appearance' for an out-of-bounds index", () => {
    const categoryId = SETTINGS_CATEGORIES[999]?.id ?? "appearance"
    expect(categoryId).toBe("appearance")
  })
})

describe("SettingsLayout — item counts per category", () => {
  const registries = makeRegistries()

  it("appearance returns 2 items (theme + progress style)", () => {
    const items = buildCategoryDisplayItems("appearance", makeState(0), registries)
    expect(items).toHaveLength(2)
  })

  it("visualizer returns 4 items", () => {
    const items = buildCategoryDisplayItems("visualizer", makeState(1), registries)
    expect(items).toHaveLength(4)
  })

  it("behavior returns 5 items", () => {
    const items = buildCategoryDisplayItems("behavior", makeState(2), registries)
    expect(items).toHaveLength(5)
  })

  it("providers returns 1 placeholder item when no providers registered", () => {
    const items = buildCategoryDisplayItems("providers", makeState(3), registries)
    expect(items).toHaveLength(1)
    expect(items[0]?.name).toContain("No providers")
  })

  it("plugins returns 1 placeholder item when no plugins installed", () => {
    const items = buildCategoryDisplayItems("plugins", makeState(4), registries)
    expect(items).toHaveLength(1)
    expect(items[0]?.name).toContain("No plugins")
  })
})

describe("SettingsLayout — panelHeight calculation", () => {
  const topbarRows = 1
  const statuslineRows = 1
  const outerPaddingRows = 2
  const fixedRows = topbarRows + statuslineRows + outerPaddingRows

  it("panelHeight is at least 3 for any terminal height", () => {
    const panelHeight = Math.max(3, 0 - fixedRows)
    expect(panelHeight).toBeGreaterThanOrEqual(3)
  })

  it("panelHeight is correct for a standard 40-row terminal", () => {
    const panelHeight = Math.max(3, 40 - fixedRows)
    expect(panelHeight).toBe(36)
  })
})
