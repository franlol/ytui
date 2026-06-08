import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppServices, RootState } from "../../state/store/store.types"
import type { ProviderInfo } from "../../types/app.types"

export const saveConfigThunk = createAsyncThunk<void, void, { extra: AppServices; state: RootState }>(
  "settings/save",
  async (_arg, { getState, extra }) => {
    const current = getState()
    await extra.configService.save({
      configVersion: 1,
      theme: current.settings.themeId,
      progressStyle: current.settings.progressStyleId,
      cavaStyle: current.settings.cavaStyleId,
      cavaSourceMode: current.settings.cavaSourceMode,
      sidebar: current.ui.sidebarCollapsed ? "off" : "on",
      defaultMode: current.settings.defaultMode === "settings" ? "normal" : current.settings.defaultMode,
      resultsLimit: current.settings.resultsLimit,
      cavaEnabled: current.settings.cavaEnabled,
      cavaHeight: current.settings.cavaHeight,
      statusTimeoutMs: current.settings.statusTimeoutMs,
      useAlternateScreen: current.settings.useAlternateScreen,
      pluginsEnabled: true,
      plugins: [],
      providerDefault: current.provider.activeProviderId,
      providersEnabled: current.provider.available.map((p: ProviderInfo) => p.id),
    })
  },
)
