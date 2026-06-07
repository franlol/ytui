export function clampThemeIndex(selectedIndex: number, themeCount: number): number {
  return Math.max(0, Math.min(selectedIndex, Math.max(0, themeCount - 1)))
}
