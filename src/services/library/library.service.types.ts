import type { Playlist } from "../../features/library/library.types"

export interface LibraryService {
  load(): Promise<Playlist[]>
  save(playlists: Playlist[]): Promise<void>
}
