import type { LibraryPanelProps } from "./library-panel.types"

const PLAYLISTS_COLS = 24

function buildTrackName(title: string, isPlaying: boolean, maxWidth: number): string {
  if (!isPlaying) return title.slice(0, maxWidth)
  return title.slice(0, maxWidth - 1).padEnd(maxWidth - 1) + "◆"
}

export function LibraryPanel(props: LibraryPanelProps) {
  const panelHeight = Math.max(3, props.heightRows)
  const tracksWidth = Math.max(10, props.widthCols - PLAYLISTS_COLS - 3)
  const innerHeight = Math.max(1, panelHeight - 2)
  const selectedPlaylist = props.playlists[props.selectedPlaylistIndex]

  const playlistFocused = props.focus === "playlists"
  const tracksFocused = props.focus === "tracks"

  return (
    <box height={panelHeight} flexDirection="row" gap={1}>
      {/* ── Playlists panel ── */}
      <box
        width={PLAYLISTS_COLS}
        borderStyle="single"
        borderColor={playlistFocused ? props.theme.accent : props.theme.border}
        title="PLAYLISTS"
        backgroundColor={props.theme.panel}
      >
        {props.playlists.length === 0 ? (
          <text content="No playlists" fg={props.theme.muted} />
        ) : (
          <select
            width={PLAYLISTS_COLS}
            height={innerHeight}
            options={props.playlists.map((p) => ({
              name: p.name.slice(0, PLAYLISTS_COLS - 3),
              description: `${p.tracks.length} track${p.tracks.length === 1 ? "" : "s"}`,
              value: p.id,
            }))}
            selectedIndex={props.selectedPlaylistIndex}
            backgroundColor={props.theme.panel}
            textColor={props.theme.text}
            selectedBackgroundColor={playlistFocused ? props.theme.selectedBg : props.theme.panel}
            selectedTextColor={playlistFocused ? props.theme.accent : props.theme.text}
            descriptionColor={props.theme.muted}
            selectedDescriptionColor={props.theme.muted}
            showDescription={true}
            showScrollIndicator={true}
            itemSpacing={0}
            wrapSelection={false}
          />
        )}
      </box>

      {/* ── Tracks panel ── */}
      <box
        flexGrow={1}
        borderStyle="single"
        borderColor={tracksFocused ? props.theme.accent : props.theme.border}
        title={
          selectedPlaylist
            ? `TRACKS — ${selectedPlaylist.name} (${selectedPlaylist.tracks.length})`
            : "TRACKS"
        }
        backgroundColor={props.theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        {!selectedPlaylist || selectedPlaylist.tracks.length === 0 ? (
          <text content="No tracks" fg={props.theme.muted} />
        ) : (
          <select
            width={tracksWidth}
            height={innerHeight}
            options={selectedPlaylist.tracks.map((t) => ({
              name: buildTrackName(t.title, t.id === props.nowPlayingTrackId, tracksWidth - 3),
              description: `${t.author}  ${t.durationLabel}`,
              value: t.id,
            }))}
            selectedIndex={props.selectedTrackIndex}
            backgroundColor={props.theme.panel}
            textColor={props.theme.text}
            selectedBackgroundColor={tracksFocused ? props.theme.selectedBg : props.theme.panel}
            selectedTextColor={tracksFocused ? props.theme.accent : props.theme.text}
            descriptionColor={props.theme.muted}
            selectedDescriptionColor={tracksFocused ? props.theme.text : props.theme.muted}
            showDescription={true}
            showScrollIndicator={true}
            itemSpacing={0}
            wrapSelection={false}
          />
        )}
      </box>
    </box>
  )
}
