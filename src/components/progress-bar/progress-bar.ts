import type { ProgressBarProps } from "./progress-bar.types"

export function ProgressBar(props: ProgressBarProps): string {
  const safeDuration = Math.max(1, props.durationSec)
  const ratio = Math.max(0, Math.min(1, props.elapsedSec / safeDuration))
  const style = props.registry.get(props.styleId)

  if (!style) {
    const filled = Math.round(props.width * ratio)
    return `${"#".repeat(filled)}${"-".repeat(Math.max(0, props.width - filled))}`
  }

  return style.render(ratio, props.width)
}
