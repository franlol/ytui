import type { LibraryFocus, Playlist } from "../../features/library/library.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type LibraryPanelProps = {
  playlists: Playlist[]
  selectedPlaylistIndex: number
  selectedTrackIndex: number
  focus: LibraryFocus
  heightRows: number
  widthCols: number
  nowPlayingTrackId: string | undefined
  theme: ThemeTokens
}
