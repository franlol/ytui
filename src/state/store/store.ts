import { configureStore, type Reducer } from "@reduxjs/toolkit"
import { playbackSlice } from "../../features/playback/playback.slice"
import { pluginsSlice } from "../../features/plugins/plugins.slice"
import { providerSlice } from "../../features/provider/provider.slice"
import { queueSlice } from "../../features/queue/queue.slice"
import { searchSlice } from "../../features/search/search.slice"
import { settingsSlice } from "../../features/settings/settings.slice"
import { uiSlice } from "../../features/ui/ui.slice"
import { visualizerSlice } from "../../features/visualizer/visualizer.slice"
import { createReducerManager } from "../reducer-manager/reducer-manager"
import type { AppServices, RootState } from "./store.types"

export function createAppStore(services: AppServices) {
  const reducerManager = createReducerManager({
    ui: uiSlice.reducer,
    search: searchSlice.reducer,
    queue: queueSlice.reducer,
    playback: playbackSlice.reducer,
    visualizer: visualizerSlice.reducer,
    settings: settingsSlice.reducer,
    provider: providerSlice.reducer,
    plugins: pluginsSlice.reducer,
  })

  const store = configureStore({
    reducer: reducerManager.reduce,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: services,
        },
      }),
  })

  return {
    store,
    reducerManager,
    injectPluginSlice: (pluginId: string, reducer: Reducer) => {
      const key = `plugin_${pluginId}`
      reducerManager.add(key, reducer)
      store.replaceReducer(reducerManager.reduce)
    },
    removePluginSlice: (pluginId: string) => {
      const key = `plugin_${pluginId}`
      reducerManager.remove(key)
      store.replaceReducer(reducerManager.reduce)
    },
  }
}

export type AppStore = ReturnType<typeof createAppStore>["store"]
export type AppStoreState = RootState
