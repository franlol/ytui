export type LogLevel = "info" | "warn" | "error" | "debug"

export type LogEntry = {
  id: string
  timestamp: number
  level: LogLevel
  source: string
  message: string
}

export type LogsState = {
  entries: LogEntry[]
  scrollOffset: number
  maxEntries: number
}
