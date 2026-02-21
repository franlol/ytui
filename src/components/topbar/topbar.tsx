import type { TopbarProps } from "./topbar.types"

export function Topbar(props: TopbarProps) {
  return (
    <box width="100%" height={1} backgroundColor={props.theme.panelAlt} paddingLeft={1} paddingRight={1}>
      <text content="YTUI - press :? for help" fg={props.theme.accent} />
    </box>
  )
}
