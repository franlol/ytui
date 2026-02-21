import type { ProviderInfo, Track } from "../../types/app.types"
import type { PlaybackSession } from "../playback/playback.service.types"

export interface SearchCapability {
  search(query: string, limit: number): Promise<Track[]>
}

export interface PlaybackCapability {
  play(track: Track): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  stop(): Promise<void>
  getPlaybackSession?(): PlaybackSession | null
}

export interface MusicProvider {
  info: ProviderInfo
  search?: SearchCapability
  playback?: PlaybackCapability
}
