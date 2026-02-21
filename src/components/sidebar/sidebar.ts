import { Box, Text } from "@opentui/core"
import type { SidebarProps } from "./sidebar.types"

const navItems = ["normal", "search", "zen", "library", "logs", "settings"]

export function Sidebar(props: SidebarProps) {
  if (props.collapsed) {
    return Box({ width: 0 })
  }

  return Box(
    {
      width: 20,
      borderStyle: "single",
      borderColor: props.theme.border,
      title: "PANELS",
      padding: 1,
      backgroundColor: props.theme.panel,
      flexDirection: "column",
    },
    ...navItems.map((name) =>
      Text({
        content: `${name === props.mode ? ">" : " "} ${name}`,
        fg: name === props.mode ? props.theme.accent : props.theme.text,
        bg: name === props.mode ? props.theme.selectedBg : undefined,
      }),
    ),
  )
}
