import { describe, expect, it } from "bun:test"
import type { Track } from "../../../types/app.types"
import { queueSlice, queueActions } from "../queue.slice"

const reducer = queueSlice.reducer

function makeTrack(id: string): Track {
  return { id, title: `Track ${id}`, author: "Artist", durationSec: 180, durationLabel: "3:00", source: "mock" }
}

const A = makeTrack("a")
const B = makeTrack("b")
const C = makeTrack("c")
const D = makeTrack("d")
const E = makeTrack("e")

describe("enqueueTrack", () => {
  it("appends track to empty queue", () => {
    const state = reducer(undefined, queueActions.enqueueTrack(A))
    expect(state.tracks).toEqual([A])
    expect(state.selectedIndex).toBe(0)
  })

  it("appends track without moving selectedIndex", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(1))
    state = reducer(state, queueActions.enqueueTrack(D))
    expect(state.tracks).toEqual([A, B, C, D])
    expect(state.selectedIndex).toBe(1)
  })
})

describe("removeTrackRange", () => {
  it("removes one track at cursor", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(1))
    state = reducer(state, queueActions.removeTrackRange({ index: 1, count: 1 }))
    expect(state.tracks).toEqual([A, C])
    expect(state.selectedIndex).toBe(1)
  })

  it("clamps cursor to last track when removing at end", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(2))
    state = reducer(state, queueActions.removeTrackRange({ index: 2, count: 1 }))
    expect(state.tracks).toEqual([A, B])
    expect(state.selectedIndex).toBe(1)
  })

  it("decrements cursor when removing a track before it", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(2))
    state = reducer(state, queueActions.removeTrackRange({ index: 0, count: 1 }))
    expect(state.tracks).toEqual([B, C])
    expect(state.selectedIndex).toBe(1)
  })

  it("resets cursor to 0 when queue becomes empty", () => {
    let state = reducer(undefined, queueActions.setQueue([A]))
    state = reducer(state, queueActions.removeTrackRange({ index: 0, count: 1 }))
    expect(state.tracks).toEqual([])
    expect(state.selectedIndex).toBe(0)
  })

  it("removes multiple tracks with count", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C, D, E]))
    state = reducer(state, queueActions.setSelectedIndex(1))
    state = reducer(state, queueActions.removeTrackRange({ index: 1, count: 3 }))
    expect(state.tracks).toEqual([A, E])
    expect(state.selectedIndex).toBe(1)
  })

  it("clamps count to available tracks when count exceeds remaining", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(1))
    state = reducer(state, queueActions.removeTrackRange({ index: 1, count: 10 }))
    expect(state.tracks).toEqual([A])
    expect(state.selectedIndex).toBe(0)
  })

  it("adjusts playingIndex when tracks before it are removed", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C, D]))
    state = reducer(state, queueActions.setPlayingIndex(3))
    state = reducer(state, queueActions.removeTrackRange({ index: 0, count: 1 }))
    expect(state.tracks).toEqual([B, C, D])
    expect(state.playingIndex).toBe(2)
  })

  it("clears playingIndex when the playing track itself is removed", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setPlayingIndex(1))
    state = reducer(state, queueActions.removeTrackRange({ index: 1, count: 1 }))
    expect(state.tracks).toEqual([A, C])
    expect(state.playingIndex).toBeNull()
  })

  it("resets playingIndex to null when queue empties", () => {
    let state = reducer(undefined, queueActions.setQueue([A]))
    state = reducer(state, queueActions.setPlayingIndex(0))
    state = reducer(state, queueActions.removeTrackRange({ index: 0, count: 1 }))
    expect(state.playingIndex).toBeNull()
  })
})

describe("clearQueue", () => {
  it("empties tracks and resets selectedIndex and playingIndex", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(2))
    state = reducer(state, queueActions.setPlayingIndex(1))
    state = reducer(state, queueActions.clearQueue())
    expect(state.tracks).toEqual([])
    expect(state.selectedIndex).toBe(0)
    expect(state.playingIndex).toBeNull()
  })
})

describe("setSelectedIndex clamping (used by gg/G)", () => {
  it("clamps to 0 on empty queue", () => {
    const state = reducer(undefined, queueActions.setSelectedIndex(5))
    expect(state.selectedIndex).toBe(0)
  })

  it("clamps to last index when out of bounds", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(99))
    expect(state.selectedIndex).toBe(2)
  })

  it("clamps negative to 0", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(-1))
    expect(state.selectedIndex).toBe(0)
  })
})

describe("setPlayingIndex", () => {
  it("sets playingIndex within bounds", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setPlayingIndex(2))
    expect(state.playingIndex).toBe(2)
  })

  it("clamps playingIndex to last valid index", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setPlayingIndex(99))
    expect(state.playingIndex).toBe(2)
  })

  it("clamps negative to 0", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setPlayingIndex(-1))
    expect(state.playingIndex).toBe(0)
  })

  it("accepts null to clear", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setPlayingIndex(1))
    state = reducer(state, queueActions.setPlayingIndex(null))
    expect(state.playingIndex).toBeNull()
  })

  it("resolves to null when queue is empty", () => {
    const state = reducer(undefined, queueActions.setPlayingIndex(0))
    expect(state.playingIndex).toBeNull()
  })
})

describe("cycleRepeatMode", () => {
  it("cycles none → one → all → none", () => {
    let state = reducer(undefined, queueActions.cycleRepeatMode())
    expect(state.repeatMode).toBe("one")
    state = reducer(state, queueActions.cycleRepeatMode())
    expect(state.repeatMode).toBe("all")
    state = reducer(state, queueActions.cycleRepeatMode())
    expect(state.repeatMode).toBe("none")
  })
})

describe("toggleShuffle", () => {
  it("flips shuffleEnabled", () => {
    let state = reducer(undefined, queueActions.toggleShuffle())
    expect(state.shuffleEnabled).toBe(true)
    state = reducer(state, queueActions.toggleShuffle())
    expect(state.shuffleEnabled).toBe(false)
  })
})

describe("setQueue", () => {
  it("resets playingIndex when replacing the queue", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B]))
    state = reducer(state, queueActions.setPlayingIndex(1))
    state = reducer(state, queueActions.setQueue([C, D, E]))
    expect(state.playingIndex).toBeNull()
    expect(state.selectedIndex).toBe(0)
  })
})
