import { Box, Text } from "@opentui/core"
import type { QueueListProps } from "./queue-list.types"

export function QueueList(props: QueueListProps) {
  const panelHeight = Math.max(3, props.heightRows)

  if (props.totalCount === 0) {
    return Box(
      {
        height: panelHeight,
        borderStyle: "single",
        borderColor: props.theme.border,
        title: "QUEUE (0)",
        backgroundColor: props.theme.panel,
        paddingLeft: 1,
        paddingRight: 1,
      },
      Text({ content: "Queue is empty", fg: props.theme.muted }),
    )
  }

  return Box(
    {
      height: panelHeight,
      borderStyle: "single",
      borderColor: props.theme.border,
      title: `QUEUE (${props.totalCount})`,
      backgroundColor: props.theme.panel,
      paddingLeft: 1,
      paddingRight: 1,
    },
    props.selectRenderable,
  )
}
