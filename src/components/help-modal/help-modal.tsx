import { Modal } from "../modal/modal"
import type { HelpModalProps } from "./help-modal.types"

const KEY_LINES = [
  "Tab / Shift+Tab   cycle modes",
  "Esc               back to NORMAL",
  ":                 command mode",
  "Space             pause/resume",
  "Enter             play selected",
  "j / k             move selection",
  "[ / ]             prev/next track  (NORMAL)",
  "[n]gg / [n]G      jump to track    (NORMAL)",
  "[n]dd             remove tracks    (NORMAL)",
  "Ctrl+P            play selected    (SEARCH/LIB)",
  "Ctrl+A            add to queue     (SEARCH/LIB)",
  "Ctrl+S            save to playlist",
  "h / l             panels (LIB) · category (SET)",
  "dd                remove track     (LIBRARY)",
  "Ctrl+D/U · G      scroll · bottom  (LOGS)",
  "click bar         seek   ·   Ctrl+C: quit",
]

const COMMAND_LINES = [
  ":q  ·  :?  (this help)",
  ":search [query]",
  ":normal · :zen · :library",
  ":logs [clear] · :settings",
  ":sidebar on|off|toggle",
  ":theme list|<name>|pick",
  ":progress list|<style>",
  ":cava style|source list|<id>",
  ":queue clear|next|prev",
  ":queue shuffle on|off|toggle",
  ":queue repeat none|one|all",
  ":playlist new|delete|rename",
  ":provider list|current|use <id>",
  ":plugin list|info <id>|reload",
]

export function HelpModal(props: HelpModalProps) {
  // 1 modes line + tallest column (heading + lines), plus border/padding chrome.
  const contentRows = 1 + 1 + Math.max(KEY_LINES.length, COMMAND_LINES.length)
  const height = Math.min(contentRows + 4, Math.max(8, props.screenHeight - 2))
  const width = Math.min(82, Math.max(48, props.screenWidth - 2))
  const columnWidth = Math.floor((width - 5) / 2)

  return (
    <Modal
      id="help-modal"
      title="HELP"
      bottomHint="Esc · q · Enter"
      theme={props.theme}
      screenWidth={props.screenWidth}
      screenHeight={props.screenHeight}
      width={width}
      height={height}
      positioning={{ strategy: "centered" }}
    >
      <text content="Modes: NORMAL · SEARCH · ZEN · LIBRARY · LOGS · SETTINGS  (Tab to cycle)" fg={props.theme.accent} />
      <box flexDirection="row" gap={1}>
        <box width={columnWidth} flexDirection="column">
          <text content="KEYS" fg={props.theme.accent} />
          {KEY_LINES.map((line) => (
            <text key={line} content={line.slice(0, columnWidth)} fg={props.theme.text} />
          ))}
        </box>
        <box width={columnWidth} flexDirection="column">
          <text content="COMMANDS" fg={props.theme.accent} />
          {COMMAND_LINES.map((line) => (
            <text key={line} content={line.slice(0, columnWidth)} fg={props.theme.text} />
          ))}
        </box>
      </box>
    </Modal>
  )
}
