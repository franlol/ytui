import { describe, expect, it } from "bun:test"
import { createAppStore } from "../../../state/store/store"
import { uiActions } from "../../ui/ui.slice"
import { playbackActions } from "../playback.slice"
import { runPlayTrackThunk, runSeekPlaybackThunk, runSyncPlaybackProgressThunk, runTogglePauseResumeThunk } from "../playback.thunks"
import type { AppServices } from "../../../state/store/store.types"
import type { MusicProvider } from "../../../services/providers/provider.types"
import type { Track } from "../../../types/app.types"
import { createDefaultVisualizerStyleRegistry } from "../../../registries/visualizer-styles/visualizer-style.registry"

const track: Track = {
  id: "t-1",
  title: "Track One",
  author: "Author",
  durationSec: 180,
  durationLabel: "03:00",
  source: "youtube",
}

class FakeProviderManager {
  private active: MusicProvider | null = null

  register(provider: MusicProvider): void {
    this.active = provider
  }

  list(): MusicProvider[] {
    return this.active ? [this.active] : []
  }

  setActive(_id: string): boolean {
    return true
  }

  getActive(): MusicProvider | null {
    return this.active
  }

  get(_id: string): MusicProvider | null {
    return this.active
  }
}

function makeServices(provider: MusicProvider): AppServices {
  const providerManager = new FakeProviderManager()
  providerManager.register(provider)

  return {
    configService: {
      load: async () => {
        throw new Error("unused in tests")
      },
      save: async () => {},
    },
    providerManager,
    visualizerService: {
      start: async () => {},
      stop: async () => {},
    },
    visualizerStyleRegistry: createDefaultVisualizerStyleRegistry(),
    commandRegistry: {} as any,
    themeRegistry: {} as any,
    progressStyleRegistry: {} as any,
    libraryService: { load: async () => [], save: async () => {} },
  }
}

describe("playback thunks", () => {
  it("plays selected track via provider playback capability", async () => {
    let playedId = ""
    let mode: string | undefined
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async (input, options) => {
          playedId = input.id
          mode = options?.cavaSourceMode
        },
        pause: async () => {},
        resume: async () => {},
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    await store.dispatch(runPlayTrackThunk(track))

    const state = store.getState()
    expect(playedId).toBe(track.id)
    expect(mode).toBe("ytui-strict")
    expect(state.playback.nowPlaying?.id).toBe(track.id)
    expect(state.playback.playing).toBe(true)
  })

  it("toggles pause and resume through provider capability", async () => {
    let paused = 0
    let resumed = 0
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {
          paused += 1
        },
        resume: async () => {
          resumed += 1
        },
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    store.dispatch(playbackActions.setPlaying(true))

    await store.dispatch(runTogglePauseResumeThunk())
    expect(store.getState().playback.playing).toBe(false)
    expect(paused).toBe(1)

    await store.dispatch(runTogglePauseResumeThunk())
    expect(store.getState().playback.playing).toBe(true)
    expect(resumed).toBe(1)
  })

  it("shows error status when provider has no playback capability", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: false, auth: false, library: false },
      },
    })

    const { store } = createAppStore(services)
    await store.dispatch(runPlayTrackThunk(track))

    expect(store.getState().ui.statusLevel).toBe("err")
    expect(store.getState().ui.statusMessage).toBe("ERR: provider has no playback capability")

    store.dispatch(uiActions.clearStatus())
    expect(store.getState().ui.statusMessage).toBeNull()
  })

  it("seeks when provider playback supports seekTo", async () => {
    let seekTarget = -1
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        seekTo: async (seconds) => {
          seekTarget = seconds
        },
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    await store.dispatch(runSeekPlaybackThunk({ targetSec: 73 }))

    expect(seekTarget).toBe(73)
    expect(store.getState().playback.elapsedSec).toBe(73)
  })

  it("shows error when provider playback does not support seek", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    await store.dispatch(runSeekPlaybackThunk({ targetSec: 30 }))

    expect(store.getState().ui.statusLevel).toBe("err")
    expect(store.getState().ui.statusMessage).toBe("ERR: seek not supported by provider")
  })

  it("syncs runtime progress from provider playback", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        getProgress: async () => ({ elapsedSec: 192, durationSec: 245, paused: false, available: true, volume: 80 }),
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    store.dispatch(playbackActions.setPlaying(true))
    await store.dispatch(runSyncPlaybackProgressThunk())

    const state = store.getState().playback
    expect(state.elapsedSec).toBe(192)
    expect(state.durationSec).toBe(245)
    expect(state.playing).toBe(true)
    expect(state.volume).toBe(80)
  })

  it("syncs volume from runtime progress and clamps to 0-100", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        getProgress: async () => ({ elapsedSec: 10, durationSec: 180, paused: false, available: true, volume: 130 }),
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    await store.dispatch(runSyncPlaybackProgressThunk())

    expect(store.getState().playback.volume).toBe(100)
  })

  it("preserves previous volume when runtime reports null", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        getProgress: async () => ({ elapsedSec: 10, durationSec: 180, paused: false, available: true, volume: null }),
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    store.dispatch(playbackActions.setVolume(55))
    await store.dispatch(runSyncPlaybackProgressThunk())

    expect(store.getState().playback.volume).toBe(55)
  })

  it("ticks elapsed during the 2-miss grace period when sync is unavailable", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        getProgress: async () => ({ elapsedSec: 0, durationSec: null, paused: false, available: false, volume: null }),
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    store.dispatch(playbackActions.setPlaying(true))
    await store.dispatch(runSyncPlaybackProgressThunk())
    await store.dispatch(runSyncPlaybackProgressThunk())

    const state = store.getState().playback
    expect(state.elapsedSec).toBe(2)
    expect(state.syncMisses).toBe(2)
    expect(state.nowPlaying).not.toBeNull()
  })

  it("syncs volume even when nothing is playing", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        getProgress: async () => ({ elapsedSec: 0, durationSec: null, paused: true, available: false, volume: 65 }),
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    expect(store.getState().playback.volume).toBeNull()
    await store.dispatch(runSyncPlaybackProgressThunk())

    expect(store.getState().playback.volume).toBe(65)
    expect(store.getState().playback.nowPlaying).toBeNull()
    expect(store.getState().playback.syncMisses).toBe(0)
  })

  it("clears nowPlaying after 3 consecutive unavailable syncs", async () => {
    const services = makeServices({
      info: {
        id: "youtube",
        name: "YouTube",
        description: "test",
        capabilities: { search: true, playback: true, auth: false, library: false },
      },
      playback: {
        play: async () => {},
        pause: async () => {},
        resume: async () => {},
        getProgress: async () => ({ elapsedSec: 0, durationSec: null, paused: false, available: false, volume: null }),
        stop: async () => {},
      },
    })

    const { store } = createAppStore(services)
    store.dispatch(playbackActions.setNowPlaying(track))
    store.dispatch(playbackActions.setPlaying(true))
    await store.dispatch(runSyncPlaybackProgressThunk())
    await store.dispatch(runSyncPlaybackProgressThunk())
    await store.dispatch(runSyncPlaybackProgressThunk())

    const state = store.getState().playback
    expect(state.nowPlaying).toBeNull()
    expect(state.playing).toBe(false)
    expect(state.syncMisses).toBe(0)
  })
})
