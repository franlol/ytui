import { describe, expect, it } from "bun:test"
import { configureStore } from "@reduxjs/toolkit"
import { settingsSlice } from "../../../features/settings/settings.slice"
import { uiActions, uiSlice } from "../../../features/ui/ui.slice"
import { createStatusTimeoutListener } from "../status-timeout"

function createTestStore(statusTimeoutMs: number) {
  const listener = createStatusTimeoutListener()
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      settings: settingsSlice.reducer,
    },
    preloadedState: {
      settings: { ...settingsSlice.getInitialState(), statusTimeoutMs },
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe("status timeout listener", () => {
  it("clears any status message after settings.statusTimeoutMs", async () => {
    const store = createTestStore(30)

    store.dispatch(uiActions.setStatus({ message: "OK: done", level: "ok" }))
    expect(store.getState().ui.statusMessage).toBe("OK: done")

    await sleep(60)
    expect(store.getState().ui.statusMessage).toBeNull()
    expect(store.getState().ui.statusLevel).toBeNull()
  })

  it("restarts the countdown when a newer status arrives", async () => {
    const store = createTestStore(50)

    store.dispatch(uiActions.setStatus({ message: "first", level: "info" }))
    await sleep(30)
    store.dispatch(uiActions.setStatus({ message: "second", level: "err" }))

    // The original timeout would have fired by now; the newer message must survive.
    await sleep(30)
    expect(store.getState().ui.statusMessage).toBe("second")

    await sleep(50)
    expect(store.getState().ui.statusMessage).toBeNull()
  })

  it("does not clear a status set after a manual clearStatus", async () => {
    const store = createTestStore(30)

    store.dispatch(uiActions.setStatus({ message: "first", level: "info" }))
    store.dispatch(uiActions.clearStatus())
    store.dispatch(uiActions.setStatus({ message: "second", level: "info" }))

    expect(store.getState().ui.statusMessage).toBe("second")
    await sleep(60)
    expect(store.getState().ui.statusMessage).toBeNull()
  })
})
