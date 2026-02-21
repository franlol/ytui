import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { SelectRenderable } from "@opentui/core"

export type QueueListProps = {
  totalCount: number
  theme: ThemeTokens
  heightRows: number
  selectRenderable: SelectRenderable
}
