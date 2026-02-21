export type PlaybackSource = {
  url: string
}

export interface PlaybackService {
  play(source: PlaybackSource): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  stop(): Promise<void>
}
