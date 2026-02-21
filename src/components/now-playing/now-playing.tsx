import { ProgressBar } from "../progress-bar/progress-bar"
import { formatTime } from "../../utils/time"
import { truncate } from "../../utils/text"
import { mapProgressClickToTargetSec } from "./now-playing.seek"
import type { NowPlayingProps } from "./now-playing.types"

export function NowPlaying(props: NowPlayingProps) {
  const contentWidth = Math.max(12, props.width - 4)

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

  const prefix = `${formatTime(props.elapsedSec)} / ${formatTime(props.durationSec)} `
  const progressWidth = Math.max(6, contentWidth - prefix.length)
  const progress = ProgressBar({
    elapsedSec: props.elapsedSec,
    durationSec: props.durationSec,
    width: progressWidth,
    styleId: props.progressStyleId,
    registry: props.progressRegistry,
  })

  const titleLine = truncate(props.track.title, contentWidth)
  const authorLine = truncate(props.track.author, contentWidth)

  const onProgressClick = (event: unknown) => {
    const value = event as { x?: number; button?: number; target?: { x?: number } }
    if (value.button !== 0) {
      return
    }

    const clickX = value.x
    const barStartX = value.target?.x
    if (typeof clickX !== "number" || typeof barStartX !== "number") {
      return
    }

    const targetSec = mapProgressClickToTargetSec({
      clickX,
      barStartX,
      barWidth: progressWidth,
      durationSec: props.durationSec,
    })

    if (targetSec === null) {
      return
    }

    props.onSeekPlayback(targetSec)
  }

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
      <box flexDirection="row" gap={0}>
        <text content={prefix} fg={props.theme.accent} />
        <text content={progress} fg={props.theme.accent} onMouseDown={onProgressClick} />
      </box>
    </box>
  )
}
