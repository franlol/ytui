import type { Track } from "../../types/app.types"

export type Playlist = {
  id: string
  name: string
  tracks: Track[]
  readonly?: boolean
}

export type LibraryFocus = "playlists" | "tracks"

export type LibraryState = {
  playlists: Playlist[]
  selectedPlaylistIndex: number
  selectedTrackIndex: number
  focus: LibraryFocus
}
