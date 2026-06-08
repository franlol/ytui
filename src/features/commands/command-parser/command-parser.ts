import type { ParsedCommand } from "./command-parser.types"

export function parseCommandInput(rawInput: string): ParsedCommand | null {
  const trimmed = rawInput.trim()
  if (!trimmed) {
    return null
  }

  const tokens = tokenize(trimmed)
  return {
    name: tokens[0] ?? "",
    args: tokens.slice(1),
  }
}

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let i = 0

  while (i < input.length) {
    if (input[i] === " ") {
      i++
      continue
    }

    if (input[i] === '"') {
      i++
      let token = ""
      while (i < input.length && input[i] !== '"') {
        token += input[i++]
      }
      if (i < input.length) i++ // consume closing quote
      tokens.push(token)
      continue
    }

    let token = ""
    while (i < input.length && input[i] !== " ") {
      token += input[i++]
    }
    tokens.push(token)
  }

  return tokens
}
