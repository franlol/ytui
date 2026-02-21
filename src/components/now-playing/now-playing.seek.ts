export type ProgressClickTarget = {
  clickX: number
  barStartX: number
  barWidth: number
  durationSec: number
}

export function mapProgressClickToTargetSec(target: ProgressClickTarget): number | null {
  if (target.barWidth <= 0) {
    return null
  }

  const relative = target.clickX - target.barStartX
  if (relative < 0 || relative >= target.barWidth) {
    return null
  }

  const ratio = target.barWidth === 1 ? 1 : relative / (target.barWidth - 1)
  const safeDuration = Math.max(1, Math.round(target.durationSec))
  return Math.max(0, Math.min(safeDuration, Math.round(ratio * safeDuration)))
}
