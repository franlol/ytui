import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { homedir } from "node:os"
import type { Playlist } from "../../features/library/library.types"
import type { LibraryService } from "./library.service.types"

const LIBRARY_PATH = join(homedir(), ".config", "ytui", "library.json")

const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: "saved", name: "Saved", tracks: [], readonly: true },
  { id: "history", name: "History", tracks: [], readonly: true },
]

export class FileLibraryService implements LibraryService {
  async load(): Promise<Playlist[]> {
    await mkdir(dirname(LIBRARY_PATH), { recursive: true })

    try {
      const raw = await readFile(LIBRARY_PATH, "utf8")
      const parsed: Playlist[] = JSON.parse(raw)
      if (!Array.isArray(parsed)) return DEFAULT_PLAYLISTS

      // Merge: ensure built-in readonly playlists are always present
      const byId = new Map(parsed.map((p) => [p.id, p]))
      const merged: Playlist[] = DEFAULT_PLAYLISTS.map((def) => {
        const saved = byId.get(def.id)
        if (saved) {
          byId.delete(def.id)
          return { ...saved, readonly: true }
        }
        return def
      })

      // Append any user playlists after the built-ins
      for (const p of byId.values()) {
        merged.push(p)
      }

      return merged
    } catch {
      return DEFAULT_PLAYLISTS
    }
  }

  async save(playlists: Playlist[]): Promise<void> {
    await mkdir(dirname(LIBRARY_PATH), { recursive: true })
    await writeFile(LIBRARY_PATH, JSON.stringify(playlists, null, 2), "utf8")
  }
}
