import { composeLeftStatusRight } from "../../utils/text"
import { formatStatusMessage, resolveStatusTextColor } from "./statusline.helpers"
import type { StatuslineProps } from "./statusline.types"

export function Statusline(props: StatuslineProps) {
  const right = `q:${props.queueLength} vol:${props.volume}% sb:${props.sidebarCollapsed ? "off" : "on"}`
  const statusMessage = formatStatusMessage(props.statusMessage, props.statusLevel)
  const statusTextColor = resolveStatusTextColor(props.theme, props.statusLevel)

  let left = `-- ${props.mode.toUpperCase()} --`
  if (props.commandActive) {
    left = `:${props.commandBuffer}`
  }

  return (
    <box width="100%" height={1} backgroundColor={props.theme.status} paddingLeft={1} paddingRight={1}>
      <text
        content={composeLeftStatusRight(left, statusMessage, right, Math.max(20, props.width - 2))}
        fg={statusTextColor}
      />
    </box>
  )
}
