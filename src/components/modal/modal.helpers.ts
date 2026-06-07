export function resolveModalWidth({
  width,
  widthFraction,
  minWidth,
  screenWidth,
}: {
  width?: number
  widthFraction?: number
  minWidth?: number
  screenWidth: number
}): number {
  const base = widthFraction != null ? Math.floor(screenWidth * widthFraction) : (width ?? screenWidth)
  return minWidth != null ? Math.max(minWidth, base) : base
}

export function resolveModalHeight({
  height,
  heightFraction,
  screenHeight,
}: {
  height?: number
  heightFraction?: number
  screenHeight: number
}): number | undefined {
  if (height != null) return height
  if (heightFraction != null) return Math.floor(screenHeight * heightFraction)
  return undefined
}

export function computeModalPosition({
  positioning,
  screenWidth,
  screenHeight,
  finalWidth,
  finalHeight,
}: {
  positioning: { strategy: "centered" } | { strategy: "top-anchored"; top: number }
  screenWidth: number
  screenHeight: number
  finalWidth: number
  finalHeight?: number
}): { top: number; left: number } {
  const left = Math.max(0, Math.floor((screenWidth - finalWidth) / 2))
  if (positioning.strategy === "top-anchored") {
    return { top: positioning.top, left }
  }
  const top = finalHeight != null ? Math.max(0, Math.floor((screenHeight - finalHeight) / 2)) : 2
  return { top, left }
}
