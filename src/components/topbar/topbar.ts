import { Box, Text } from "@opentui/core"
import type { TopbarProps } from "./topbar.types"

export function Topbar(props: TopbarProps) {
  return Box(
    {
      width: "100%",
      height: 1,
      backgroundColor: props.theme.panelAlt,
      paddingLeft: 1,
      paddingRight: 1,
    },
    Text({ content: "YTUI - press :? for help", fg: props.theme.accent }),
  )
}
