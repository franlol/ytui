export type Mode = "normal" | "search" | "zen"

export type StatusLevel = "ok" | "err" | "info"

export type Track = {
  id: string
  title: string
  author: string
  durationSec: number
  durationLabel: string
  source: "mock" | "youtube"
}

export type ProviderCapabilities = {
  search: boolean
  playback: boolean
  auth: boolean
  library: boolean
}

export type ProviderInfo = {
  id: string
  name: string
  description: string
  capabilities: ProviderCapabilities
}
