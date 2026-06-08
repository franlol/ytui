import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track } from "../../types/app.types"
import type { LibraryFocus, LibraryState, Playlist } from "./library.types"

const BUILT_IN_PLAYLISTS: Playlist[] = [
  { id: "saved", name: "Saved", tracks: [], readonly: true },
  { id: "history", name: "History", tracks: [], readonly: true },
]

const initialState: LibraryState = {
  playlists: BUILT_IN_PLAYLISTS,
  selectedPlaylistIndex: 0,
  selectedTrackIndex: 0,
  focus: "playlists",
}

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setPlaylists(state, action: PayloadAction<Playlist[]>) {
      state.playlists = action.payload
      state.selectedPlaylistIndex = Math.min(state.selectedPlaylistIndex, Math.max(0, action.payload.length - 1))
      state.selectedTrackIndex = 0
    },
    setFocus(state, action: PayloadAction<LibraryFocus>) {
      state.focus = action.payload
    },
    movePlaylistDown(state) {
      state.selectedPlaylistIndex = Math.min(state.selectedPlaylistIndex + 1, Math.max(0, state.playlists.length - 1))
      state.selectedTrackIndex = 0
    },
    movePlaylistUp(state) {
      state.selectedPlaylistIndex = Math.max(0, state.selectedPlaylistIndex - 1)
      state.selectedTrackIndex = 0
    },
    moveTrackDown(state) {
      const playlist = state.playlists[state.selectedPlaylistIndex]
      if (!playlist) return
      state.selectedTrackIndex = Math.min(state.selectedTrackIndex + 1, Math.max(0, playlist.tracks.length - 1))
    },
    moveTrackUp(state) {
      state.selectedTrackIndex = Math.max(0, state.selectedTrackIndex - 1)
    },
    addTrackToPlaylist(state, action: PayloadAction<{ playlistId: string; track: Track }>) {
      const { playlistId, track } = action.payload
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return
      if (playlist.tracks.some((t) => t.id === track.id)) return
      playlist.tracks.push(track)
    },
    removeTrackFromPlaylist(state, action: PayloadAction<{ playlistId: string; trackId: string }>) {
      const { playlistId, trackId } = action.payload
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return
      const idx = playlist.tracks.findIndex((t) => t.id === trackId)
      if (idx === -1) return
      playlist.tracks.splice(idx, 1)
      state.selectedTrackIndex = Math.min(state.selectedTrackIndex, Math.max(0, playlist.tracks.length - 1))
    },
    createPlaylist(state, action: PayloadAction<{ id: string; name: string }>) {
      const { id, name } = action.payload
      if (state.playlists.some((p) => p.id === id)) return
      state.playlists.push({ id, name, tracks: [] })
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      const idx = state.playlists.findIndex((p) => p.id === action.payload)
      if (idx === -1) return
      if (state.playlists[idx]?.readonly) return
      state.playlists.splice(idx, 1)
      state.selectedPlaylistIndex = Math.min(state.selectedPlaylistIndex, Math.max(0, state.playlists.length - 1))
      state.selectedTrackIndex = 0
    },
    renamePlaylist(state, action: PayloadAction<{ id: string; name: string }>) {
      const playlist = state.playlists.find((p) => p.id === action.payload.id)
      if (!playlist || playlist.readonly) return
      playlist.name = action.payload.name
    },
    prependToHistory(state, action: PayloadAction<Track>) {
      const history = state.playlists.find((p) => p.id === "history")
      if (!history) return
      // Remove existing entry so it moves to front
      const existing = history.tracks.findIndex((t) => t.id === action.payload.id)
      if (existing !== -1) history.tracks.splice(existing, 1)
      history.tracks.unshift(action.payload)
      // Cap history at 100 entries
      if (history.tracks.length > 100) history.tracks.length = 100
    },
  },
})

export const libraryActions = librarySlice.actions
