import { computeModalPosition, resolveModalHeight, resolveModalWidth } from "./modal.helpers"
import type { ModalProps } from "./modal.types"

export function Modal(props: ModalProps) {
  const positioning = props.positioning ?? { strategy: "centered" }
  const finalWidth = resolveModalWidth({
    width: props.width,
    widthFraction: props.widthFraction,
    minWidth: props.minWidth,
    screenWidth: props.screenWidth,
  })
  const finalHeight = resolveModalHeight({
    height: props.height,
    heightFraction: props.heightFraction,
    screenHeight: props.screenHeight,
  })
  const { top, left } = computeModalPosition({
    positioning,
    screenWidth: props.screenWidth,
    screenHeight: props.screenHeight,
    finalWidth,
    finalHeight,
  })

  return (
    <box
      id={props.id}
      position="absolute"
      top={top}
      left={left}
      width={finalWidth}
      height={finalHeight}
      borderStyle="double"
      borderColor={props.theme.accent}
      title={props.title}
      titleAlignment="center"
      bottomTitle={props.bottomHint}
      bottomTitleAlignment="center"
      backgroundColor={props.theme.panelAlt}
      padding={1}
      flexDirection="column"
      gap={0}
    >
      {props.children}
    </box>
  )
}
