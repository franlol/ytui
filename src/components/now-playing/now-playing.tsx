import { ProgressBar } from "../progress-bar/progress-bar"
import { formatTime } from "../../utils/time"
import { truncate } from "../../utils/text"
import type { NowPlayingProps } from "./now-playing.types"

export function NowPlaying(props: NowPlayingProps) {
  if (!props.track) {
    return (
      <box
        height={5}
        borderStyle="single"
        borderColor={props.theme.border}
        title="NOW PLAYING"
        backgroundColor={props.theme.panelAlt}
        padding={1}
      >
        <text content="Nothing playing" fg={props.theme.muted} />
      </box>
    )
  }

  const progress = ProgressBar({
    elapsedSec: props.elapsedSec,
    durationSec: props.durationSec,
    width: 28,
    styleId: props.progressStyleId,
    registry: props.progressRegistry,
  })

  return (
    <box
      height={5}
      borderStyle="single"
      borderColor={props.theme.border}
      title="NOW PLAYING"
      backgroundColor={props.theme.panelAlt}
      padding={1}
      gap={0}
    >
      <text content={truncate(props.track.title, Math.max(20, props.width - 10))} fg={props.theme.text} />
      <text content={props.track.author} fg={props.theme.muted} />
      <text content={`${formatTime(props.elapsedSec)} / ${formatTime(props.durationSec)}  ${progress}`} fg={props.theme.accent} />
    </box>
  )
}
