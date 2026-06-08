import { SETTINGS_CATEGORIES } from "./settings-panel.helpers"
import type { SettingsPanelProps } from "./settings-panel.types"

// Tab strip is 3 rows (top border + label + bottom border).
// Content pane border costs 2 rows.
const TAB_ROWS = 3
const LEGEND_ROWS = 3
const CONTENT_BORDER_ROWS = 2

export function SettingsPanel(props: SettingsPanelProps) {
  const panelHeight = Math.max(TAB_ROWS + LEGEND_ROWS + CONTENT_BORDER_ROWS + 1, props.heightRows)
  const innerHeight = Math.max(1, panelHeight - TAB_ROWS - LEGEND_ROWS - CONTENT_BORDER_ROWS)

  const activeCategory = SETTINGS_CATEGORIES[props.categoryIndex]

  const rowsPerItem = 2
  const maxVisible = Math.max(1, Math.floor(innerHeight / rowsPerItem))
  const scrollStart = Math.max(
    0,
    Math.min(
      props.itemIndex - Math.floor(maxVisible / 2),
      Math.max(0, props.items.length - maxVisible),
    ),
  )
  const visibleItems = props.items.slice(scrollStart, scrollStart + maxVisible)

  return (
    <box height={panelHeight} flexDirection="column">
      <box flexDirection="row">
        {SETTINGS_CATEGORIES.map((c, i) => {
          const sel = i === props.categoryIndex
          return (
            <box
              key={c.id}
              borderStyle="single"
              borderColor={sel ? props.theme.accent : props.theme.border}
              backgroundColor={sel ? props.theme.selectedBg : props.theme.panel}
              paddingLeft={1}
              paddingRight={1}
            >
              <text
                content={c.label}
                fg={sel ? props.theme.accent : props.theme.muted}
                bg={sel ? props.theme.selectedBg : props.theme.panel}
              />
            </box>
          )
        })}
      </box>

      <box flexDirection="row" paddingTop={1} paddingBottom={1} backgroundColor={props.theme.bg}>
        <text content="  " fg={props.theme.muted} bg={props.theme.bg} />
        <text content="h/l" fg={props.theme.text} bg={props.theme.bg} />
        <text content=" switch tab" fg={props.theme.muted} bg={props.theme.bg} />
        <text content="  │  " fg={props.theme.border} bg={props.theme.bg} />
        <text content="j/k" fg={props.theme.text} bg={props.theme.bg} />
        <text content=" move" fg={props.theme.muted} bg={props.theme.bg} />
        <text content="  │  " fg={props.theme.border} bg={props.theme.bg} />
        <text content="←/→" fg={props.theme.text} bg={props.theme.bg} />
        <text content=" change" fg={props.theme.muted} bg={props.theme.bg} />
        <text content="  │  " fg={props.theme.border} bg={props.theme.bg} />
        <text content="Esc" fg={props.theme.text} bg={props.theme.bg} />
        <text content=" exit" fg={props.theme.muted} bg={props.theme.bg} />
      </box>

      <box
        flexGrow={1}
        borderStyle="single"
        borderColor={props.theme.accent}
        title={activeCategory ? activeCategory.label.toUpperCase() : ""}
        backgroundColor={props.theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        {props.items.length === 0 ? (
          <text content="No settings in this category." fg={props.theme.muted} />
        ) : (
          <box flexDirection="column" height={innerHeight}>
            {visibleItems.map((item, i) => {
              const absIdx = scrollStart + i
              const isSel = absIdx === props.itemIndex
              const isDisabled = item.disabled === true

              const nameFg = isDisabled
                ? props.theme.muted
                : isSel
                ? props.theme.accent
                : props.theme.text

              const bg = isSel && !isDisabled ? props.theme.selectedBg : props.theme.panel
              const cursor = isSel ? ">" : " "

              return (
                <box key={absIdx} flexDirection="column" backgroundColor={bg}>
                  <text content={`${cursor} ${item.name}`} fg={nameFg} bg={bg} />
                  <text content={`  ${item.description}`} fg={props.theme.muted} bg={bg} />
                </box>
              )
            })}
          </box>
        )}
      </box>
    </box>
  )
}
