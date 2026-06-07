import { readdir, readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type { ThemeDefinition, ThemeBaseTokens, ThemeTokenInput } from "../../../registries/themes/theme.registry.types"
import type { ThemeLoadResult } from "./theme-loader.types"

const THEMES_DIR = join(homedir(), ".config", "ytui", "themes")

const REQUIRED_BASE_TOKEN_KEYS: (keyof ThemeBaseTokens)[] = [
  "bg",
  "panel",
  "panelAlt",
  "text",
  "muted",
  "accent",
  "border",
  "status",
  "statusText",
  "selectedBg",
]

export async function loadUserThemes(builtinIds: Set<string>): Promise<ThemeLoadResult[]> {
  try {
    const entries = await readdir(THEMES_DIR, { withFileTypes: true })
    const jsonFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)

    return Promise.all(
      jsonFiles.map(async (filename): Promise<ThemeLoadResult> => {
        const filePath = join(THEMES_DIR, filename)
        try {
          const raw = await readFile(filePath, "utf8")
          const parsed: unknown = JSON.parse(raw)
          const definition = validateThemeDefinition(parsed, builtinIds)
          return { filename, definition }
        } catch (error) {
          return {
            filename,
            error: error instanceof Error ? error.message : "Invalid theme file",
          }
        }
      }),
    )
  } catch {
    return []
  }
}

function validateThemeDefinition(input: unknown, builtinIds: Set<string>): ThemeDefinition {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Theme file must be a JSON object")
  }

  const obj = input as Record<string, unknown>

  if (!obj.id || typeof obj.id !== "string") {
    throw new Error("Theme missing required field 'id'")
  }
  if (!obj.description || typeof obj.description !== "string") {
    throw new Error("Theme missing required field 'description'")
  }
  if (typeof obj.tokens !== "object" || obj.tokens === null || Array.isArray(obj.tokens)) {
    throw new Error("Theme missing required field 'tokens' (must be an object)")
  }

  if (builtinIds.has(obj.id)) {
    throw new Error(`Theme id '${obj.id}' conflicts with a built-in theme and will be ignored`)
  }

  const tokens = obj.tokens as Record<string, unknown>
  for (const key of REQUIRED_BASE_TOKEN_KEYS) {
    if (typeof tokens[key] !== "string" || !(tokens[key] as string).trim()) {
      throw new Error(`Theme token '${key}' is required and must be a non-empty string`)
    }
  }

  return {
    id: obj.id,
    description: obj.description,
    tokens: tokens as ThemeTokenInput,
  }
}
