export type CavaSourceMode = "ytui-strict" | "ytui-best-effort" | "system"

export type PlaybackSource = {
  url: string
  cavaSourceMode?: CavaSourceMode
}

export type PlaybackSession = {
  id: string
  visualizerSource: string | null
  visualizerSourceMode: CavaSourceMode
  visualizerSourceVerified: boolean
}

export type PlaybackProgress = {
  elapsedSec: number
  durationSec: number | null
  paused: boolean
  available: boolean
}

export interface PlaybackService {
  play(source: PlaybackSource): Promise<PlaybackSession>
  pause(): Promise<void>
  resume(): Promise<void>
  seekTo(seconds: number): Promise<void>
  getProgress(): Promise<PlaybackProgress>
  stop(): Promise<void>
  getCurrentSession(): PlaybackSession | null
}
