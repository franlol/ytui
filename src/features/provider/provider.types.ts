import type { ProviderInfo } from "../../types/app.types"

export type ProviderState = {
  activeProviderId: string
  available: ProviderInfo[]
}
