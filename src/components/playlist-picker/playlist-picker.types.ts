import type { Playlist } from "../../features/library/library.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type PlaylistPickerProps = {
  playlists: Playlist[]
  selectedIndex: number
  theme: ThemeTokens
  screenWidth: number
  screenHeight: number
}
