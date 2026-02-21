import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { homedir } from "node:os"
import type { AppConfig } from "../../types/config.types"
import type { ConfigService } from "./config.service.types"

const CONFIG_PATH = join(homedir(), ".config", "ytui", "ytui.conf")

const DEFAULT_CONFIG: AppConfig = {
  configVersion: 1,
  theme: "gruvbox",
  progressStyle: "blocks",
  sidebar: "on",
  defaultMode: "normal",
  resultsLimit: 20,
  cavaEnabled: true,
  cavaHeight: 2,
  statusTimeoutMs: 2200,
  useAlternateScreen: false,
  pluginsEnabled: true,
  plugins: [],
  providerDefault: "youtube",
  providersEnabled: ["youtube"],
}

export class FileConfigService implements ConfigService {
  async load(): Promise<AppConfig> {
    await mkdir(dirname(CONFIG_PATH), { recursive: true })

    try {
      const raw = await readFile(CONFIG_PATH, "utf8")
      const parsed = parseConfig(raw)
      return { ...DEFAULT_CONFIG, ...parsed }
    } catch {
      await this.save(DEFAULT_CONFIG)
      return DEFAULT_CONFIG
    }
  }

  async save(config: AppConfig): Promise<void> {
    await mkdir(dirname(CONFIG_PATH), { recursive: true })
    const content = stringifyConfig(config)
    await writeFile(CONFIG_PATH, content, "utf8")
  }
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback
  }
  return value.toLowerCase() === "true"
}

function parseInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) {
    return fallback
  }
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }
  return Math.max(min, Math.min(max, parsed))
}

function parseStringList(value: string | undefined): string[] {
  if (!value) {
    return []
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function parseConfig(raw: string): Partial<AppConfig> {
  const lines = raw.split(/\r?\n/)
  const entries: Record<string, string> = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "")
    entries[key] = value
  }

  return {
    configVersion: parseInteger(entries.CONFIG_VERSION, DEFAULT_CONFIG.configVersion, 1, 999),
    theme: entries.THEME ?? DEFAULT_CONFIG.theme,
    progressStyle: entries.PROGRESS_STYLE ?? DEFAULT_CONFIG.progressStyle,
    sidebar: entries.SIDEBAR === "off" ? "off" : "on",
    defaultMode: entries.DEFAULT_MODE === "search" || entries.DEFAULT_MODE === "zen" ? entries.DEFAULT_MODE : "normal",
    resultsLimit: parseInteger(entries.RESULTS_LIMIT, DEFAULT_CONFIG.resultsLimit, 1, 100),
    cavaEnabled: parseBoolean(entries.CAVA_ENABLED, DEFAULT_CONFIG.cavaEnabled),
    cavaHeight: parseInteger(entries.CAVA_HEIGHT, DEFAULT_CONFIG.cavaHeight, 1, 8),
    statusTimeoutMs: parseInteger(entries.STATUS_TIMEOUT_MS, DEFAULT_CONFIG.statusTimeoutMs, 500, 10000),
    useAlternateScreen: parseBoolean(entries.USE_ALTERNATE_SCREEN, DEFAULT_CONFIG.useAlternateScreen),
    pluginsEnabled: parseBoolean(entries.PLUGINS_ENABLED, DEFAULT_CONFIG.pluginsEnabled),
    plugins: parseStringList(entries.PLUGINS),
    providerDefault: entries.PROVIDER_DEFAULT ?? DEFAULT_CONFIG.providerDefault,
    providersEnabled: parseStringList(entries.PROVIDERS_ENABLED),
  }
}

function stringifyConfig(config: AppConfig): string {
  const lines = [
    "# YTUI configuration",
    `CONFIG_VERSION=\"${config.configVersion}\"`,
    `THEME=\"${config.theme}\"`,
    `PROGRESS_STYLE=\"${config.progressStyle}\"`,
    `SIDEBAR=\"${config.sidebar}\"`,
    `DEFAULT_MODE=\"${config.defaultMode}\"`,
    `RESULTS_LIMIT=\"${config.resultsLimit}\"`,
    `CAVA_ENABLED=\"${config.cavaEnabled}\"`,
    `CAVA_HEIGHT=\"${config.cavaHeight}\"`,
    `STATUS_TIMEOUT_MS=\"${config.statusTimeoutMs}\"`,
    `USE_ALTERNATE_SCREEN=\"${config.useAlternateScreen}\"`,
    `PLUGINS_ENABLED=\"${config.pluginsEnabled}\"`,
    `PLUGINS=\"${config.plugins.join(",")}\"`,
    `PROVIDER_DEFAULT=\"${config.providerDefault}\"`,
    `PROVIDERS_ENABLED=\"${config.providersEnabled.join(",")}\"`,
    "",
  ]

  return lines.join("\n")
}
