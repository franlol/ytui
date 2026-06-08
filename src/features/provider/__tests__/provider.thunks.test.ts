import { describe, expect, it, mock } from "bun:test"
import { switchActiveProviderThunk } from "../provider.thunks"
import type { RootState } from "../../../state/store/store.types"

function makeGetState(activeProviderId: string, availableIds: string[]) {
  return () =>
    ({
      provider: {
        activeProviderId,
        available: availableIds.map((id) => ({ id, name: id, description: "", capabilities: {} })),
      },
    }) as unknown as RootState
}

function makeExtra(setActiveMock: ReturnType<typeof mock>) {
  return {
    providerManager: { setActive: setActiveMock },
  } as never
}

describe("switchActiveProviderThunk", () => {
  it("calls providerManager.setActive with the new provider id", async () => {
    const dispatchMock = mock(() => undefined)
    const setActiveMock = mock(() => true)
    const thunk = switchActiveProviderThunk("spotify")
    await thunk(
      dispatchMock as never,
      makeGetState("youtube", ["youtube", "spotify"]),
      makeExtra(setActiveMock),
    )
    expect(setActiveMock).toHaveBeenCalledWith("spotify")
  })

  it("does not call providerManager.setActive if provider id is not available", async () => {
    const dispatchMock = mock(() => undefined)
    const setActiveMock = mock(() => false)
    const thunk = switchActiveProviderThunk("unknown")
    await thunk(
      dispatchMock as never,
      makeGetState("youtube", ["youtube"]),
      makeExtra(setActiveMock),
    )
    expect(setActiveMock).not.toHaveBeenCalled()
  })
})
