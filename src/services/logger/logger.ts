import { logsActions } from "../../features/logs/logs.slice"
import type { AppDispatch } from "../../state/store/store.types"
import type { ILogger, LogLevel } from "./logger.types"

export class Logger implements ILogger {
  constructor(private readonly dispatch: AppDispatch) {}

  info(source: string, message: string): void {
    this.log("info", source, message)
  }

  warn(source: string, message: string): void {
    this.log("warn", source, message)
  }

  error(source: string, message: string): void {
    this.log("error", source, message)
  }

  debug(source: string, message: string): void {
    this.log("debug", source, message)
  }

  private log(level: LogLevel, source: string, message: string): void {
    this.dispatch(logsActions.addEntry({ level, source, message }))
  }
}
