import type { Track } from "../../types/app.types"

export type PlaybackState = {
  nowPlaying: Track | null
  elapsedSec: number
  durationSec: number
  playing: boolean
  volume: number
}
