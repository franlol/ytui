import type { LogLevel } from "../../features/logs/logs.slice.types"

export type { LogLevel }

export interface ILogger {
  info(source: string, message: string): void
  warn(source: string, message: string): void
  error(source: string, message: string): void
  debug(source: string, message: string): void
}
