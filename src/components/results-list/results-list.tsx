import type { ResultsListProps } from "./results-list.types"

export function ResultsList(props: ResultsListProps) {
  const panelHeight = Math.max(3, props.heightRows)
  const selectedIndex = Math.max(0, Math.min(props.selectedIndex, Math.max(0, props.tracks.length - 1)))

  if (props.totalCount === 0) {
    return (
      <box
        height={panelHeight}
        borderStyle="single"
        borderColor={props.theme.border}
        title="RESULTS (0)"
        backgroundColor={props.theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        <text content="No results" fg={props.theme.muted} />
      </box>
    )
  }

  return (
    <box
      height={panelHeight}
      borderStyle="single"
      borderColor={props.theme.border}
      title={`RESULTS (${props.totalCount})`}
      backgroundColor={props.theme.panel}
      paddingLeft={1}
      paddingRight={1}
    >
      <select
        width={props.widthCols}
        height={Math.max(1, panelHeight - 2)}
        options={props.tracks.map((track) => ({
          name: track.title,
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
