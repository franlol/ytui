import type { RootState } from "../../state/store/store.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type ZenLayoutProps = {
  state: RootState
  width: number
  height: number
  theme: ThemeTokens
}
