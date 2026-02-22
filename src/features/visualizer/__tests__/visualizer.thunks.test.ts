import { describe, expect, it } from "bun:test"
import { createAppStore } from "../../../state/store/store"
import { runStartVisualizerThunk, runStopVisualizerThunk } from "../visualizer.thunks"
import type { AppServices } from "../../../state/store/store.types"
import type { MusicProvider } from "../../../services/providers/provider.types"
import { createDefaultVisualizerStyleRegistry } from "../../../registries/visualizer-styles/visualizer-style.registry"

class FakeProviderManager {
  register(_provider: MusicProvider): void {}
  list(): MusicProvider[] {
    return []
  }
  setActive(_id: string): boolean {
    return true
  }
  getActive(): MusicProvider | null {
    return null
  }
  get(_id: string): MusicProvider | null {
    return null
  }
}

function makeServices() {
  let frameListener: ((bars: number[]) => void) | null = null
  const services: AppServices = {
    configService: {
      load: async () => {
        throw new Error("unused")
      },
      save: async () => {},
    },
    providerManager: new FakeProviderManager(),
    visualizerService: {
      start: async (_session, onFrame) => {
        frameListener = onFrame
      },
      stop: async () => {
        frameListener = null
      },
    },
    visualizerStyleRegistry: createDefaultVisualizerStyleRegistry(),
    commandRegistry: {} as any,
    themeRegistry: {} as any,
    progressStyleRegistry: {} as any,
  }

  return {
    services,
    emitFrame: (bars: number[]) => {
      frameListener?.(bars)
    },
  }
}

describe("visualizer thunks", () => {
  it("starts visualizer and applies incoming frames", async () => {
    const { services, emitFrame } = makeServices()
    const { store } = createAppStore(services)

    await store.dispatch(
      runStartVisualizerThunk({
        id: "s1",
        visualizerSource: "ytui_s1.monitor",
        visualizerSourceMode: "ytui-strict",
        visualizerSourceVerified: true,
      }),
    )
    emitFrame([1, 4, 7])

    const state = store.getState().visualizer
    expect(state.running).toBe(true)
    expect(state.sessionId).toBe("s1")
    expect(state.bars).toEqual([1, 4, 7])
  })

  it("stops visualizer and resets state", async () => {
    const { services } = makeServices()
    const { store } = createAppStore(services)

    await store.dispatch(
      runStartVisualizerThunk({
        id: "s1",
        visualizerSource: "ytui_s1.monitor",
        visualizerSourceMode: "ytui-strict",
        visualizerSourceVerified: true,
      }),
    )
    await store.dispatch(runStopVisualizerThunk())

    const state = store.getState().visualizer
    expect(state.running).toBe(false)
    expect(state.sessionId).toBeNull()
    expect(state.bars).toEqual([])
  })

  it("does not start visualizer when strict source is unverified", async () => {
    const { services } = makeServices()
    const { store } = createAppStore(services)

    await store.dispatch(
      runStartVisualizerThunk({
        id: "s1",
        visualizerSource: "ytui_s1.monitor",
        visualizerSourceMode: "ytui-strict",
        visualizerSourceVerified: false,
      }),
    )

    const state = store.getState().visualizer
    expect(state.running).toBe(false)
    expect(state.unavailable).toBe(true)
  })
})
