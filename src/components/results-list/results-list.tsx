import { useEffect, useState } from "react"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { ResultsListProps } from "./results-list.types"

function Spinner({ theme }: { theme: ThemeTokens }) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % frames.length), 80)
    return () => clearInterval(id)
  }, [])
  return <text content={`  ${frames[frame]}  searching...`} fg={theme.muted} />
}

function buildName(title: string, isPlaying: boolean, widthCols: number): string {
  // Select draws text at col 1 with a 2-char prefix — name fits in widthCols - 3
  const maxWidth = widthCols - 3
  if (!isPlaying) return title.slice(0, maxWidth)
  return title.slice(0, maxWidth - 1).padEnd(maxWidth - 1) + "◆"
}

export function ResultsList(props: ResultsListProps) {
  const panelHeight = Math.max(3, props.heightRows)
  const selectedIndex = Math.max(0, Math.min(props.selectedIndex, Math.max(0, props.tracks.length - 1)))

  if (props.isLoading) {
    return (
      <box
        height={panelHeight}
        borderStyle="single"
        borderColor={props.theme.border}
        title="RESULTS"
        backgroundColor={props.theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        <Spinner theme={props.theme} />
      </box>
    )
  }

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
