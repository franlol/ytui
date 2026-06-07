import type { ReactNode } from "react"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

export type ModalPositioning =
  | { strategy: "top-anchored"; top: number }
  | { strategy: "centered" }

export type ModalProps = {
  id: string
  title: string
  bottomHint?: string
  theme: ThemeTokens
  screenWidth: number
  screenHeight: number
  width?: number
  widthFraction?: number
  minWidth?: number
  height?: number
  heightFraction?: number
  positioning?: ModalPositioning
  children?: ReactNode
}
