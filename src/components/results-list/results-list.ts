import { Box, Text } from "@opentui/core"
import type { ResultsListProps } from "./results-list.types"

export function ResultsList(props: ResultsListProps) {
  const panelHeight = Math.max(3, props.heightRows)

  if (props.totalCount === 0) {
    return Box(
      {
        height: panelHeight,
        borderStyle: "single",
        borderColor: props.theme.border,
        title: "RESULTS (0)",
        backgroundColor: props.theme.panel,
        paddingLeft: 1,
        paddingRight: 1,
      },
      Text({ content: "No results", fg: props.theme.muted }),
    )
  }

  return Box(
    {
      height: panelHeight,
      borderStyle: "single",
      borderColor: props.theme.border,
      title: `RESULTS (${props.totalCount})`,
      backgroundColor: props.theme.panel,
      paddingLeft: 1,
      paddingRight: 1,
    },
    props.selectRenderable,
  )
}
