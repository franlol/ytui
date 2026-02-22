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

export interface PlaybackService {
  play(source: PlaybackSource): Promise<PlaybackSession>
  pause(): Promise<void>
  resume(): Promise<void>
  seekTo(seconds: number): Promise<void>
  stop(): Promise<void>
  getCurrentSession(): PlaybackSession | null
}
