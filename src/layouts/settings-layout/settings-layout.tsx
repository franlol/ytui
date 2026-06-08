import { SettingsPanel } from "../../components/settings-panel/settings-panel"
import { buildCategoryDisplayItems, SETTINGS_CATEGORIES } from "../../components/settings-panel/settings-panel.helpers"
import { Sidebar } from "../../components/sidebar/sidebar"
import type { SettingsLayoutProps } from "./settings-layout.types"

export function SettingsLayout(props: SettingsLayoutProps) {
  const { state, width, height, themeRegistry, progressStyleRegistry, visualizerStyleRegistry } = props
  const theme = themeRegistry.getTokens(state.settings.themeId)

  const outerPaddingCols = 2
  const sidebarCols = state.ui.sidebarCollapsed ? 0 : 20
  const layoutGapCols = state.ui.sidebarCollapsed ? 0 : 1
  const contentWidth = Math.max(24, width - outerPaddingCols - sidebarCols - layoutGapCols)

  const topbarRows = 1
  const statuslineRows = 1
  const outerPaddingRows = 2
  const fixedRows = topbarRows + statuslineRows + outerPaddingRows
  const panelHeight = Math.max(3, height - fixedRows)

  const categoryId = SETTINGS_CATEGORIES[state.ui.settingsCategoryIndex]?.id ?? "appearance"
  const items = buildCategoryDisplayItems(
    categoryId,
    state,
    { themeRegistry, progressStyleRegistry, visualizerStyleRegistry },
  )

  return (
    <box width="100%" flexGrow={1} flexDirection="row" gap={1} padding={1}>
      <Sidebar collapsed={state.ui.sidebarCollapsed} mode={state.ui.mode} theme={theme} />
      <box flexGrow={1} flexDirection="column">
        <SettingsPanel
          categoryIndex={state.ui.settingsCategoryIndex}
          itemIndex={state.ui.settingsItemIndex}
          items={items}
          heightRows={panelHeight}
          widthCols={contentWidth}
          theme={theme}
        />
      </box>
    </box>
  )
}
