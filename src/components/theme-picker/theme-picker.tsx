import { Modal } from "../modal/modal"
import { clampThemeIndex } from "./theme-picker.helpers"
import type { ThemePickerProps } from "./theme-picker.types"

const PICKER_WIDTH = 60
const ROWS_PER_ITEM = 2

export function ThemePicker(props: ThemePickerProps) {
  const innerHeight = props.themes.length * ROWS_PER_ITEM
  const modalHeight = Math.floor(props.screenHeight * 0.6)
  const selectHeight = Math.min(innerHeight, Math.max(1, modalHeight - 4))
  const selectedIndex = clampThemeIndex(props.selectedIndex, props.themes.length)

  return (
    <Modal
      id="theme-picker"
      title="THEMES"
      bottomHint="j/k · Enter · Esc"
      theme={props.theme}
      screenWidth={props.screenWidth}
      screenHeight={props.screenHeight}
      width={PICKER_WIDTH}
      heightFraction={0.6}
      positioning={{ strategy: "centered" }}
    >
      <select
        width={PICKER_WIDTH - 4}
        height={selectHeight}
        options={props.themes.map((t) => ({
          name: t.id,
          description: t.description,
          value: t.id,
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
    </Modal>
  )
}
