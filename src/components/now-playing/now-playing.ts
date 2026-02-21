import { Box, Text } from "@opentui/core"
import { ProgressBar } from "../progress-bar/progress-bar"
import { formatTime } from "../../utils/time"
import { truncate } from "../../utils/text"
import type { NowPlayingProps } from "./now-playing.types"

export function NowPlaying(props: NowPlayingProps) {
  if (!props.track) {
    return Box(
      {
        height: 5,
        borderStyle: "single",
        borderColor: props.theme.border,
        title: "NOW PLAYING",
        backgroundColor: props.theme.panelAlt,
        padding: 1,
      },
      Text({ content: "Nothing playing", fg: props.theme.muted }),
    )
  }

  const progress = ProgressBar({
    elapsedSec: props.elapsedSec,
    durationSec: props.durationSec,
    width: 28,
    styleId: props.progressStyleId,
    registry: props.progressRegistry,
  })

  return Box(
    {
      height: 5,
      borderStyle: "single",
      borderColor: props.theme.border,
      title: "NOW PLAYING",
      backgroundColor: props.theme.panelAlt,
      padding: 1,
      gap: 0,
    },
    Text({ content: truncate(props.track.title, Math.max(20, props.width - 10)), fg: props.theme.text }),
    Text({ content: props.track.author, fg: props.theme.muted }),
    Text({ content: `${formatTime(props.elapsedSec)} / ${formatTime(props.durationSec)}  ${progress}`, fg: props.theme.accent }),
  )
}
