import type { SidebarProps } from "./sidebar.types"

const navItems = ["normal", "search", "zen", "library", "logs", "settings"]

export function Sidebar(props: SidebarProps) {
  if (props.collapsed) {
    return <box width={0} />
  }

  return (
    <box
      width={20}
      borderStyle="single"
      borderColor={props.theme.border}
      title="PANELS"
      padding={1}
      backgroundColor={props.theme.panel}
      flexDirection="column"
    >
      {navItems.map((name) => (
        <text
          key={name}
          content={`${name === props.mode ? ">" : " "} ${name}`}
          fg={name === props.mode ? props.theme.accent : props.theme.text}
          bg={name === props.mode ? props.theme.selectedBg : undefined}
        />
      ))}
    </box>
  )
}
