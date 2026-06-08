import type { Track } from "../../types/app.types"

export type RepeatMode = "none" | "one" | "all"

export type QueueState = {
  tracks: Track[]
  selectedIndex: number
  playingIndex: number | null
  repeatMode: RepeatMode
  shuffleEnabled: boolean
}
