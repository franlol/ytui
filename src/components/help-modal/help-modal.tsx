import type { HelpModalProps } from "./help-modal.types"

export function HelpModal(props: HelpModalProps) {
  const modalWidth = Math.max(48, Math.floor(props.width * 0.68))
  const left = Math.max(2, Math.floor((props.width - modalWidth) / 2))

  return (
    <box
      id="help-modal"
      position="absolute"
      top={2}
      left={left}
      width={modalWidth}
      borderStyle="double"
      borderColor={props.theme.accent}
      title="HELP"
      backgroundColor={props.theme.panelAlt}
      padding={1}
      flexDirection="column"
      gap={0}
    >
      <text content="Modes: NORMAL SEARCH ZEN" fg={props.theme.text} />
      <text content="Tab: next mode" fg={props.theme.text} />
      <text content="Esc: back to normal" fg={props.theme.text} />
      <text content=":sidebar toggle|on|off" fg={props.theme.text} />
      <text content=":progress list | :progress <style>" fg={props.theme.text} />
      <text content=":cava style list|<id> | :cava source list|<mode>" fg={props.theme.text} />
      <text content=":theme list | :theme <name>" fg={props.theme.text} />
      <text content=":provider list|current|use <id>" fg={props.theme.text} />
      <text content=":plugin list|info <id>|reload" fg={props.theme.text} />
      <text content="Enter (NORMAL): play selected queue track" fg={props.theme.text} />
      <text content="Ctrl+P (SEARCH): play selected result" fg={props.theme.text} />
      <text content="Space: pause/resume current track" fg={props.theme.text} />
      <text content="Click NOW PLAYING bar: seek" fg={props.theme.text} />
      <text content="Close help: Esc / q / Enter" fg={props.theme.muted} />
    </box>
  )
}
