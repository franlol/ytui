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
})

describe("clearQueue", () => {
  it("empties tracks and resets selectedIndex", () => {
    let state = reducer(undefined, queueActions.setQueue([A, B, C]))
    state = reducer(state, queueActions.setSelectedIndex(2))
    state = reducer(state, queueActions.clearQueue())
    expect(state.tracks).toEqual([])
    expect(state.selectedIndex).toBe(0)
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
