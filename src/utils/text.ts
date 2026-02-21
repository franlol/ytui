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

export function composeLeftStatusRight(left: string, status: string | null, right: string, width: number): string {
  if (!status) {
    return composeLeftRight(left, right, width)
  }

  const maxPrefix = Math.max(4, width - right.length - 1)
  const clampedLeft = truncate(left, maxPrefix)

  let prefix = clampedLeft
  const statusWidth = maxPrefix - clampedLeft.length - 2
  if (statusWidth > 0) {
    prefix = `${clampedLeft}  ${truncate(status, statusWidth)}`
  }

  const spacing = Math.max(1, width - prefix.length - right.length)
  return `${prefix}${" ".repeat(spacing)}${right}`
}
