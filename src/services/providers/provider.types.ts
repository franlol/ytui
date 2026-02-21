import type { ProviderInfo, Track } from "../../types/app.types"

export interface SearchCapability {
  search(query: string, limit: number): Promise<Track[]>
}

export interface PlaybackCapability {
  play(track: Track): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  stop(): Promise<void>
}

export interface MusicProvider {
  info: ProviderInfo
  search?: SearchCapability
  playback?: PlaybackCapability
}
