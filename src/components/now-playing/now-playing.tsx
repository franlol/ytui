import { ProgressBar } from "../progress-bar/progress-bar"
import { formatTime } from "../../utils/time"
import { truncate } from "../../utils/text"
import type { NowPlayingProps } from "./now-playing.types"

export function NowPlaying(props: NowPlayingProps) {
  const contentWidth = Math.max(12, props.width - 6)

  if (!props.track) {
    return (
      <box
        height={5}
        borderStyle="single"
        borderColor={props.theme.border}
        title="NOW PLAYING"
        backgroundColor={props.theme.panelAlt}
        paddingLeft={1}
        paddingRight={1}
      >
        <text content="Nothing playing" fg={props.theme.muted} />
      </box>
    )
  }

  const progress = ProgressBar({
    elapsedSec: props.elapsedSec,
    durationSec: props.durationSec,
    width: Math.max(6, contentWidth - 14),
    styleId: props.progressStyleId,
    registry: props.progressRegistry,
  })

  const titleLine = truncate(props.track.title, contentWidth)
  const authorLine = truncate(props.track.author, contentWidth)
  const timingLine = truncate(`${formatTime(props.elapsedSec)} / ${formatTime(props.durationSec)} ${progress}`, contentWidth)

  return (
    <box
      height={5}
      borderStyle="single"
      borderColor={props.theme.border}
      title="NOW PLAYING"
      backgroundColor={props.theme.panelAlt}
      paddingLeft={1}
      paddingRight={1}
      gap={0}
    >
      <text content={titleLine} fg={props.theme.text} />
      <text content={authorLine} fg={props.theme.muted} />
      <text content={timingLine} fg={props.theme.accent} />
    </box>
  )
}
