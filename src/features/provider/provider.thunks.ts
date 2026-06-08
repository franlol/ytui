import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppServices, RootState } from "../../state/store/store.types"
import { providerActions } from "./provider.slice"

export const switchActiveProviderThunk = createAsyncThunk<void, string, { extra: AppServices; state: RootState }>(
  "provider/switchActive",
  async (id, { dispatch, getState, extra }) => {
    if (!getState().provider.available.some((p) => p.id === id)) return
    extra.providerManager.setActive(id)
    dispatch(providerActions.setActiveProvider(id))
  },
)
