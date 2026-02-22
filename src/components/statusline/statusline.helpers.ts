import type { StatusLevel } from "../../types/app.types"
import type { ThemeTokens } from "../../registries/themes/theme.registry.types"

const PREFIX_PATTERN = /^(OK|ERR|INFO):\s*/i

export function formatStatusMessage(message: string | null, level: StatusLevel | null): string | null {
  if (!message) {
    return null
  }

  if (!level) {
    return message
  }

  const body = message.replace(PREFIX_PATTERN, "")
  return `${toStatusPrefix(level)} ${body}`
}

export function resolveStatusTextColor(theme: ThemeTokens, level: StatusLevel | null): string {
  if (level === "ok") {
    return theme.statusOkText
  }

  if (level === "err") {
    return theme.statusErrText
  }

  if (level === "info") {
    return theme.statusInfoText
  }

  return theme.statusText
}

function toStatusPrefix(level: StatusLevel): string {
  if (level === "ok") {
    return "OK:"
  }

  if (level === "err") {
    return "ERR:"
  }

  return "INFO:"
}
