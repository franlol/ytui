import type { ParsedCommand } from "./command-parser.types"

export function parseCommandInput(rawInput: string): ParsedCommand | null {
  const trimmed = rawInput.trim()
  if (!trimmed) {
    return null
  }

  const parts = trimmed.split(/\s+/)
  return {
    name: parts[0],
    args: parts.slice(1),
  }
}
