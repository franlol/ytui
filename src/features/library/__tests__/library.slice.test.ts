import { describe, expect, it } from "bun:test"
import { libraryActions, librarySlice } from "../library.slice"
import type { LibraryState } from "../library.types"
import type { Track } from "../../../types/app.types"

const track = (id: string): Track => ({
  id,
  title: `Track ${id}`,
  author: "Author",
  durationSec: 180,
  durationLabel: "3:00",
  source: "mock",
})

function reduce(state: LibraryState, action: ReturnType<(typeof libraryActions)[keyof typeof libraryActions]>): LibraryState {
  return librarySlice.reducer(state, action)
}

const initial = librarySlice.getInitialState()

describe("initial state", () => {
  it("has saved and history as built-in readonly playlists", () => {
    expect(initial.playlists).toHaveLength(2)
    expect(initial.playlists[0]?.id).toBe("saved")
    expect(initial.playlists[0]?.readonly).toBe(true)
    expect(initial.playlists[1]?.id).toBe("history")
    expect(initial.playlists[1]?.readonly).toBe(true)
  })

  it("starts with focus on playlists", () => {
    expect(initial.focus).toBe("playlists")
  })
})

describe("setFocus", () => {
  it("switches focus to tracks", () => {
    const state = reduce(initial, libraryActions.setFocus("tracks"))
    expect(state.focus).toBe("tracks")
  })

  it("switches focus back to playlists", () => {
    const s1 = reduce(initial, libraryActions.setFocus("tracks"))
    const s2 = reduce(s1, libraryActions.setFocus("playlists"))
    expect(s2.focus).toBe("playlists")
  })
})

describe("movePlaylistDown / movePlaylistUp", () => {
  it("moves down and resets selectedTrackIndex", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("t1") }))
    const s2 = reduce({ ...s1, selectedTrackIndex: 0 }, libraryActions.movePlaylistDown())
    expect(s2.selectedPlaylistIndex).toBe(1)
    expect(s2.selectedTrackIndex).toBe(0)
  })

  it("clamps at last index", () => {
    const state = { ...initial, selectedPlaylistIndex: 1 }
    const s = reduce(state, libraryActions.movePlaylistDown())
    expect(s.selectedPlaylistIndex).toBe(1)
  })

  it("moves up and resets selectedTrackIndex", () => {
    const state = { ...initial, selectedPlaylistIndex: 1, selectedTrackIndex: 2 }
    const s = reduce(state, libraryActions.movePlaylistUp())
    expect(s.selectedPlaylistIndex).toBe(0)
    expect(s.selectedTrackIndex).toBe(0)
  })

  it("clamps at 0", () => {
    const s = reduce(initial, libraryActions.movePlaylistUp())
    expect(s.selectedPlaylistIndex).toBe(0)
  })
})

describe("moveTrackDown / moveTrackUp", () => {
  it("moves down within track list", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("a") }))
    const s2 = reduce(s1, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("b") }))
    const s3 = reduce(s2, libraryActions.moveTrackDown())
    expect(s3.selectedTrackIndex).toBe(1)
  })

  it("clamps at last track", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("a") }))
    const s2 = reduce(s1, libraryActions.moveTrackDown())
    expect(s2.selectedTrackIndex).toBe(0)
  })

  it("moves up", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("a") }))
    const s2 = reduce(s1, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("b") }))
    const s3 = reduce({ ...s2, selectedTrackIndex: 1 }, libraryActions.moveTrackUp())
    expect(s3.selectedTrackIndex).toBe(0)
  })

  it("clamps at 0", () => {
    const s = reduce(initial, libraryActions.moveTrackUp())
    expect(s.selectedTrackIndex).toBe(0)
  })
})

describe("createPlaylist", () => {
  it("appends a new playlist", () => {
    const s = reduce(initial, libraryActions.createPlaylist({ id: "my-mix", name: "My Mix" }))
    expect(s.playlists).toHaveLength(3)
    expect(s.playlists[2]?.id).toBe("my-mix")
  })

  it("is a no-op for duplicate id", () => {
    const s = reduce(initial, libraryActions.createPlaylist({ id: "saved", name: "Duplicate" }))
    expect(s.playlists).toHaveLength(2)
  })
})

describe("deletePlaylist", () => {
  it("deletes a user playlist", () => {
    const s1 = reduce(initial, libraryActions.createPlaylist({ id: "work", name: "Work" }))
    const s2 = reduce(s1, libraryActions.deletePlaylist("work"))
    expect(s2.playlists).toHaveLength(2)
    expect(s2.playlists.find((p) => p.id === "work")).toBeUndefined()
  })

  it("is a no-op for readonly playlists", () => {
    const s = reduce(initial, libraryActions.deletePlaylist("saved"))
    expect(s.playlists).toHaveLength(2)
  })

  it("clamps selectedPlaylistIndex after deletion", () => {
    const s1 = reduce(initial, libraryActions.createPlaylist({ id: "p1", name: "P1" }))
    const s2 = reduce({ ...s1, selectedPlaylistIndex: 2 }, libraryActions.deletePlaylist("p1"))
    expect(s2.selectedPlaylistIndex).toBe(1)
  })
})

describe("renamePlaylist", () => {
  it("renames a user playlist", () => {
    const s1 = reduce(initial, libraryActions.createPlaylist({ id: "work", name: "Work" }))
    const s2 = reduce(s1, libraryActions.renamePlaylist({ id: "work", name: "Office" }))
    expect(s2.playlists.find((p) => p.id === "work")?.name).toBe("Office")
  })

  it("is a no-op for readonly playlists", () => {
    const s = reduce(initial, libraryActions.renamePlaylist({ id: "saved", name: "Hacked" }))
    expect(s.playlists.find((p) => p.id === "saved")?.name).toBe("Saved")
  })
})

describe("addTrackToPlaylist", () => {
  it("appends a track", () => {
    const s = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("t1") }))
    expect(s.playlists.find((p) => p.id === "saved")?.tracks).toHaveLength(1)
  })

  it("deduplicates by track id", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("t1") }))
    const s2 = reduce(s1, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("t1") }))
    expect(s2.playlists.find((p) => p.id === "saved")?.tracks).toHaveLength(1)
  })

  it("is a no-op for unknown playlist id", () => {
    const s = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "nonexistent", track: track("t1") }))
    expect(s).toEqual(initial)
  })
})

describe("removeTrackFromPlaylist", () => {
  it("removes a track", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("t1") }))
    const s2 = reduce(s1, libraryActions.removeTrackFromPlaylist({ playlistId: "saved", trackId: "t1" }))
    expect(s2.playlists.find((p) => p.id === "saved")?.tracks).toHaveLength(0)
  })

  it("clamps selectedTrackIndex after removal", () => {
    const s1 = reduce(initial, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("a") }))
    const s2 = reduce(s1, libraryActions.addTrackToPlaylist({ playlistId: "saved", track: track("b") }))
    const s3 = reduce({ ...s2, selectedTrackIndex: 1 }, libraryActions.removeTrackFromPlaylist({ playlistId: "saved", trackId: "b" }))
    expect(s3.selectedTrackIndex).toBe(0)
  })
})

describe("prependToHistory", () => {
  it("prepends a track to history", () => {
    const s = reduce(initial, libraryActions.prependToHistory(track("t1")))
    expect(s.playlists.find((p) => p.id === "history")?.tracks[0]?.id).toBe("t1")
  })

  it("moves existing entry to front instead of duplicating", () => {
    const s1 = reduce(initial, libraryActions.prependToHistory(track("a")))
    const s2 = reduce(s1, libraryActions.prependToHistory(track("b")))
    const s3 = reduce(s2, libraryActions.prependToHistory(track("a")))
    const history = s3.playlists.find((p) => p.id === "history")?.tracks ?? []
    expect(history).toHaveLength(2)
    expect(history[0]?.id).toBe("a")
    expect(history[1]?.id).toBe("b")
  })

  it("caps history at 100 entries", () => {
    let state = initial
    for (let i = 0; i < 105; i++) {
      state = reduce(state, libraryActions.prependToHistory(track(`t${i}`)))
    }
    expect(state.playlists.find((p) => p.id === "history")?.tracks.length).toBe(100)
  })
})
