import type { AppConfig } from "../../types/config.types"

export interface ConfigService {
  load(): Promise<AppConfig>
  save(config: AppConfig): Promise<void>
}
