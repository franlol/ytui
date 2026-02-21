export function formatTime(totalSec: number): string {
  const minute = Math.floor(totalSec / 60)
  const second = Math.max(0, totalSec % 60)
  return `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
}
