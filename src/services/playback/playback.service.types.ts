export type PlaybackSource = {
  url: string
}

export type PlaybackSession = {
  id: string
  visualizerSource: string | null
}

export interface PlaybackService {
  play(source: PlaybackSource): Promise<PlaybackSession>
  pause(): Promise<void>
  resume(): Promise<void>
  stop(): Promise<void>
  getCurrentSession(): PlaybackSession | null
}
