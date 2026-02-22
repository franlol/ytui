import type { ProviderInfo, Track } from "../../types/app.types"
import type { CavaSourceMode, PlaybackProgress, PlaybackSession } from "../playback/playback.service.types"

export type PlaybackRequestOptions = {
  cavaSourceMode?: CavaSourceMode
}

export interface SearchCapability {
  search(query: string, limit: number): Promise<Track[]>
}

export interface PlaybackCapability {
  play(track: Track, options?: PlaybackRequestOptions): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  seekTo?(seconds: number): Promise<void>
  getProgress?(): Promise<PlaybackProgress>
  stop(): Promise<void>
  getPlaybackSession?(): PlaybackSession | null
}

export interface MusicProvider {
  info: ProviderInfo
  search?: SearchCapability
  playback?: PlaybackCapability
}
