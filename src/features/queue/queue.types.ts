import type { Track } from "../../types/app.types"

export type QueueState = {
  tracks: Track[]
  selectedIndex: number
}
