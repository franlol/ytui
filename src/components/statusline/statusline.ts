import { Box, Text } from "@opentui/core"
import { composeLeftRight } from "../../utils/text"
import type { StatuslineProps } from "./statusline.types"

export function Statusline(props: StatuslineProps) {
  const right = `q:${props.queueLength} vol:${props.volume}% sb:${props.sidebarCollapsed ? "off" : "on"}`

  let left = `-- ${props.mode.toUpperCase()} --`
  if (props.commandActive) {
    left = `:${props.commandBuffer}`
  }
  if (props.statusMessage) {
    left = props.statusMessage
  }

  return Box(
    {
      width: "100%",
      height: 1,
      backgroundColor: props.theme.status,
      paddingLeft: 1,
      paddingRight: 1,
    },
    Text({
      content: composeLeftRight(left, right, Math.max(20, props.width - 2)),
      fg: props.theme.statusText,
    }),
  )
}
