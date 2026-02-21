import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"

export type ProgressBarProps = {
  elapsedSec: number
  durationSec: number
  width: number
  styleId: string
  registry: ProgressStyleRegistry
}
