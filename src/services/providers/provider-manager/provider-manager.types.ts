import type { MusicProvider } from "../provider.types"

export interface ProviderManager {
  register(provider: MusicProvider): void
  list(): MusicProvider[]
  setActive(id: string): boolean
  getActive(): MusicProvider | null
  get(id: string): MusicProvider | null
}
