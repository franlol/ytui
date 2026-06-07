import type { QueueListProps } from "./queue-list.types"

function buildName(title: string, isPlaying: boolean, widthCols: number): string {
  const maxWidth = widthCols - 3
  if (!isPlaying) return title.slice(0, maxWidth)
  return title.slice(0, maxWidth - 1).padEnd(maxWidth - 1) + "◆"
}

export function QueueList(props: QueueListProps) {
  const panelHeight = Math.max(3, props.heightRows)
  const selectedIndex = Math.max(0, Math.min(props.selectedIndex, Math.max(0, props.tracks.length - 1)))

  if (props.totalCount === 0) {
    return (
      <box
        height={panelHeight}
        borderStyle="single"
        borderColor={props.theme.border}
        title="QUEUE (0)"
        backgroundColor={props.theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        <text content="Queue is empty" fg={props.theme.muted} />
      </box>
    )
  }

  return (
    <box
      height={panelHeight}
      borderStyle="single"
      borderColor={props.theme.border}
      title={`QUEUE (${props.totalCount})`}
      backgroundColor={props.theme.panel}
      paddingLeft={1}
      paddingRight={1}
    >
      <select
        width={props.widthCols}
        height={Math.max(1, panelHeight - 2)}
        options={props.tracks.map((track) => ({
          name: buildName(track.title, track.id === props.nowPlayingTrackId, props.widthCols),
          description: `${track.author}  ${track.durationLabel}`,
          value: track.id,
        }))}
        selectedIndex={selectedIndex}
        backgroundColor={props.theme.panel}
        textColor={props.theme.text}
        selectedBackgroundColor={props.theme.selectedBg}
        selectedTextColor={props.theme.accent}
        descriptionColor={props.theme.muted}
        selectedDescriptionColor={props.theme.text}
        showDescription={true}
        showScrollIndicator={true}
        itemSpacing={0}
        wrapSelection={false}
      />
    </box>
  )
}
