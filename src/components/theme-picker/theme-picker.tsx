import { clampThemeIndex } from "./theme-picker.helpers"
import type { ThemePickerProps } from "./theme-picker.types"

const PICKER_WIDTH = 60
// showDescription=true renders name + description on separate rows
const ROWS_PER_ITEM = 2

export function ThemePicker(props: ThemePickerProps) {
  const innerHeight = props.themes.length * ROWS_PER_ITEM
  const boxHeight = innerHeight + 4 // 2 borders + 2 padding (top+bottom)
  const left = Math.max(0, Math.floor((props.screenWidth - PICKER_WIDTH) / 2))
  const top = Math.max(0, Math.floor((props.screenHeight - boxHeight) / 2))
  const selectedIndex = clampThemeIndex(props.selectedIndex, props.themes.length)

  return (
    <box
      id="theme-picker"
      position="absolute"
      top={top}
      left={left}
      width={PICKER_WIDTH}
      height={boxHeight}
      borderStyle="double"
      borderColor={props.theme.accent}
      title="THEMES  j/k · Enter · Esc"
      backgroundColor={props.theme.panelAlt}
      padding={1}
    >
      <select
        width={PICKER_WIDTH - 4}
        height={innerHeight}
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
    </box>
  )
}
