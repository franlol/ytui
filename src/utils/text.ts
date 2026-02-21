export function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value
  }
  if (max <= 3) {
    return value.slice(0, max)
  }
  return `${value.slice(0, max - 3)}...`
}

export function composeLeftRight(left: string, right: string, width: number): string {
  const maxLeft = Math.max(4, width - right.length - 1)
  const clampedLeft = truncate(left, maxLeft)
  const spacing = Math.max(1, width - clampedLeft.length - right.length)
  return `${clampedLeft}${" ".repeat(spacing)}${right}`
}
