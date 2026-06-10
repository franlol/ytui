import { createListenerMiddleware } from "@reduxjs/toolkit"
import { uiActions } from "../../features/ui/ui.slice"
import type { RootState } from "../store/store.types"

// Single owner of the statusline message lifetime: every setStatus dispatched
// anywhere in the app auto-clears after settings.statusTimeoutMs. A newer
// setStatus cancels the pending clear and restarts the countdown.
export function createStatusTimeoutListener() {
  const listener = createListenerMiddleware()

  listener.startListening({
    actionCreator: uiActions.setStatus,
    effect: async (_action, api) => {
      api.cancelActiveListeners()
      const timeoutMs = (api.getState() as RootState).settings.statusTimeoutMs
      await api.delay(timeoutMs)
      api.dispatch(uiActions.clearStatus())
    },
  })

  return listener
}
