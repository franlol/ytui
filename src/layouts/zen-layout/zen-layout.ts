import { Box, Text } from "@opentui/core"
import { CavaPanel } from "../../components/cava-panel/cava-panel"
import { truncate } from "../../utils/text"
import type { ZenLayoutProps } from "./zen-layout.types"

export function ZenLayout(props: ZenLayoutProps) {
  const title = truncate(props.state.playback.nowPlaying?.title ?? "Nothing playing", Math.max(20, props.width - 6))

  return Box(
    {
      width: "100%",
      flexGrow: 1,
      flexDirection: "column",
      gap: 1,
      padding: 1,
    },
    Box(
      {
        borderStyle: "single",
        borderColor: props.theme.border,
        backgroundColor: props.theme.panel,
        padding: 1,
      },
      Text({ content: title, fg: props.theme.text }),
    ),
    CavaPanel({
      phase: props.state.visualizer.phase,
      width: Math.max(16, props.width - 6),
      lines: Math.max(4, props.height - 8),
      fill: true,
      theme: props.theme,
    }),
  )
}
