import type { ProgressStyleRegistry } from "../../registries/progress-styles/progress-style.registry"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { Track } from "../../types/app.types"

export type NowPlayingProps = {
  track: Track | null
  elapsedSec: number
  durationSec: number
  progressStyleId: string
  progressRegistry: ProgressStyleRegistry
  theme: ThemeTokens
  width: number
  onSeekPlayback: (targetSec: number) => void
}
