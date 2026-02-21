import type { MusicProvider } from "../provider.types"
import type { ProviderManager } from "./provider-manager.types"

export class DefaultProviderManager implements ProviderManager {
  private providers = new Map<string, MusicProvider>()
  private activeProviderId: string | null = null

  register(provider: MusicProvider) {
    this.providers.set(provider.info.id, provider)
    if (!this.activeProviderId) {
      this.activeProviderId = provider.info.id
    }
  }

  list(): MusicProvider[] {
    return Array.from(this.providers.values())
  }

  setActive(id: string): boolean {
    if (!this.providers.has(id)) {
      return false
    }
    this.activeProviderId = id
    return true
  }

  getActive(): MusicProvider | null {
    if (!this.activeProviderId) {
      return null
    }
    return this.providers.get(this.activeProviderId) ?? null
  }

  get(id: string): MusicProvider | null {
    return this.providers.get(id) ?? null
  }
}
