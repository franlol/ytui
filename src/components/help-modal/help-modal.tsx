import { Modal } from "../modal/modal"
import type { HelpModalProps } from "./help-modal.types"

export function HelpModal(props: HelpModalProps) {
  return (
    <Modal
      id="help-modal"
      title="HELP"
      bottomHint="Esc · q · Enter"
      theme={props.theme}
      screenWidth={props.screenWidth}
      screenHeight={props.screenHeight}
      widthFraction={0.68}
      minWidth={48}
      heightFraction={0.6}
      positioning={{ strategy: "centered" }}
    >
      <text content="Modes: NORMAL SEARCH ZEN" fg={props.theme.text} />
      <text content="Tab: next mode  Shift+Tab: prev mode" fg={props.theme.text} />
      <text content="Esc: back to normal" fg={props.theme.text} />
      <text content=":sidebar toggle|on|off" fg={props.theme.text} />
      <text content=":progress list | :progress <style>" fg={props.theme.text} />
      <text content=":cava style list|<id> | :cava source list|<mode>" fg={props.theme.text} />
      <text content=":theme list | :theme <name> | :theme pick" fg={props.theme.text} />
      <text content=":provider list|current|use <id>" fg={props.theme.text} />
      <text content=":plugin list|info <id>|reload" fg={props.theme.text} />
      <text content="Ctrl+A (SEARCH): add result to queue" fg={props.theme.text} />
      <text content="[n]gg / [n]G (NORMAL): jump to track n (default first/last)" fg={props.theme.text} />
      <text content="[n]dd (NORMAL): delete n tracks from cursor (default 1)" fg={props.theme.text} />
      <text content=":queue clear" fg={props.theme.text} />
      <text content="Enter (NORMAL): play selected queue track" fg={props.theme.text} />
      <text content="Ctrl+P (SEARCH): play selected result" fg={props.theme.text} />
      <text content="Space: pause/resume current track" fg={props.theme.text} />
      <text content="Click NOW PLAYING bar: seek" fg={props.theme.text} />
    </Modal>
  )
}
