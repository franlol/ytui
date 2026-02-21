import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ProviderInfo } from "../../types/app.types"
import type { ProviderState } from "./provider.types"

const initialState: ProviderState = {
  activeProviderId: "youtube",
  available: [],
}

export const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    setProviders(state, action: PayloadAction<ProviderInfo[]>) {
      state.available = action.payload
      if (!state.available.some((provider) => provider.id === state.activeProviderId) && state.available[0]) {
        state.activeProviderId = state.available[0].id
      }
    },
    setActiveProvider(state, action: PayloadAction<string>) {
      state.activeProviderId = action.payload
    },
  },
})

export const providerActions = providerSlice.actions
