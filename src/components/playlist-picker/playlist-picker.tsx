import { Modal } from "../modal/modal"
import type { PlaylistPickerProps } from "./playlist-picker.types"

const PICKER_WIDTH = 50
const ROWS_PER_ITEM = 2

export function PlaylistPicker(props: PlaylistPickerProps) {
  const innerHeight = props.playlists.length * ROWS_PER_ITEM
  const modalHeight = Math.floor(props.screenHeight * 0.5)
  const selectHeight = Math.min(innerHeight, Math.max(1, modalHeight - 4))
  const selectedIndex = Math.max(0, Math.min(props.selectedIndex, props.playlists.length - 1))

  return (
    <Modal
      id="playlist-picker"
      title="SAVE TO PLAYLIST"
      bottomHint="j/k · Enter · Esc"
      theme={props.theme}
      screenWidth={props.screenWidth}
      screenHeight={props.screenHeight}
      width={PICKER_WIDTH}
      heightFraction={0.5}
      positioning={{ strategy: "centered" }}
    >
      {props.playlists.length === 0 ? (
        <text content="No playlists available" fg={props.theme.muted} />
      ) : (
        <select
          width={PICKER_WIDTH - 4}
          height={selectHeight}
          options={props.playlists.map((p) => ({
            name: p.name,
            description: `${p.tracks.length} track${p.tracks.length === 1 ? "" : "s"}`,
            value: p.id,
          }))}
          selectedIndex={selectedIndex}
          backgroundColor={props.theme.panelAlt}
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
      )}
    </Modal>
  )
}
