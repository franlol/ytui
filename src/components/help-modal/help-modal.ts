import { Box, Text } from "@opentui/core"
import type { HelpModalProps } from "./help-modal.types"

export function HelpModal(props: HelpModalProps) {
  const modalWidth = Math.max(48, Math.floor(props.width * 0.68))
  const left = Math.max(2, Math.floor((props.width - modalWidth) / 2))

  return Box(
    {
      id: "help-modal",
      position: "absolute",
      top: 2,
      left,
      width: modalWidth,
      borderStyle: "double",
      borderColor: props.theme.accent,
      title: "HELP",
      backgroundColor: props.theme.panelAlt,
      padding: 1,
      flexDirection: "column",
      gap: 0,
    },
    Text({ content: "Modes: NORMAL SEARCH ZEN", fg: props.theme.text }),
    Text({ content: "Tab: next mode", fg: props.theme.text }),
    Text({ content: "Esc: back to normal", fg: props.theme.text }),
    Text({ content: ":sidebar toggle|on|off", fg: props.theme.text }),
    Text({ content: ":progress list | :progress <style>", fg: props.theme.text }),
    Text({ content: ":theme list | :theme <name>", fg: props.theme.text }),
    Text({ content: ":provider list|current|use <id>", fg: props.theme.text }),
    Text({ content: ":plugin list|info <id>|reload", fg: props.theme.text }),
    Text({ content: "Close help: Esc / q / Enter", fg: props.theme.muted }),
  )
}
