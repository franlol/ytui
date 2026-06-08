import type { LogEntry, LogLevel } from "../../features/logs/logs.slice.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"
import type { LogsPanelProps } from "./logs-panel.types"

const LEVEL_LABEL: Record<LogLevel, string> = {
  info: "INF",
  warn: "WRN",
  error: "ERR",
  debug: "DBG",
}

function levelColor(level: LogLevel, theme: ThemeTokens): string {
  switch (level) {
    case "error": return theme.statusErrText
    case "warn": return theme.statusInfoText
    case "info": return theme.text
    case "debug": return theme.muted
  }
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const ss = String(d.getSeconds()).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

function formatEntry(entry: LogEntry, widthCols: number): string {
  const prefix = `${formatTimestamp(entry.timestamp)}  ${LEVEL_LABEL[entry.level]}  `
  const sourceField = entry.source.slice(0, 12).padEnd(12)
  const available = Math.max(0, widthCols - prefix.length - sourceField.length - 2)
  const msg = entry.message.slice(0, available)
  return `${prefix}${sourceField}  ${msg}`
}

export function LogsPanel(props: LogsPanelProps) {
  const panelHeight = Math.max(3, props.heightRows)
  const contentHeight = Math.max(1, panelHeight - 2)
  const total = props.entries.length

  const windowEnd = Math.min(total, props.scrollOffset + 1)
  const windowStart = Math.max(0, windowEnd - contentHeight)
  const visible = props.entries.slice(windowStart, windowEnd)

  const isAtBottom = total === 0 || props.scrollOffset >= total - 1
  const title = `LOGS (${total})${isAtBottom ? " [FOLLOW]" : ""}`

  if (total === 0) {
    return (
      <box
        height={panelHeight}
        borderStyle="single"
        borderColor={props.theme.border}
        title={title}
        backgroundColor={props.theme.panel}
        paddingLeft={1}
        paddingRight={1}
      >
        <text content="No log entries." fg={props.theme.muted} />
      </box>
    )
  }

  return (
    <box
      height={panelHeight}
      borderStyle="single"
      borderColor={props.theme.border}
      title={title}
      backgroundColor={props.theme.panel}
      paddingLeft={1}
      paddingRight={1}
      flexDirection="column"
    >
      {visible.map((entry) => (
        <text
          key={entry.id}
          content={formatEntry(entry, props.widthCols)}
          fg={levelColor(entry.level, props.theme)}
          bg={props.theme.panel}
        />
      ))}
    </box>
  )
}
