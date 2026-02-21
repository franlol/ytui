import { spawn } from "node:child_process"
import type { SearchResultItem, SearchService } from "./search.service.types"

type YtDlpEntry = {
  id?: string
  title?: string
  duration?: number
  uploader?: string
  channel?: string
  uploader_id?: string
  channel_id?: string
}

export class SearchServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SearchServiceError"
  }
}

export class YtDlpSearchService implements SearchService {
  constructor(private readonly binaryPath = "yt-dlp") {}

  async search(query: string, limit: number): Promise<SearchResultItem[]> {
    const normalized = query.trim()
    if (!normalized) {
      return []
    }

    const safeLimit = Math.max(1, Math.min(100, limit))
    const target = `ytsearch${safeLimit}:${normalized}`
    const args = [
      "--dump-json",
      "--flat-playlist",
      "--playlist-end",
      String(safeLimit),
      "--no-warnings",
      "--skip-download",
      target,
    ]

    const rawOutput = await runCommand(this.binaryPath, args)
    const lines = rawOutput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const parsed: SearchResultItem[] = []
    for (const line of lines) {
      const item = parseYtDlpLine(line)
      if (item) {
        parsed.push(item)
      }
    }

    return parsed.slice(0, safeLimit)
  }
}

export function parseYtDlpLine(line: string): SearchResultItem | null {
  let decoded: YtDlpEntry
  try {
    decoded = JSON.parse(line) as YtDlpEntry
  } catch {
    return null
  }

  if (!decoded.id || !decoded.title) {
    return null
  }

  const durationSec = Number.isFinite(decoded.duration) ? Math.max(0, Math.floor(decoded.duration ?? 0)) : 0
  const author = decodeAuthor(decoded)

  return {
    id: decoded.id,
    title: decoded.title,
    author,
    durationSec,
    durationLabel: formatDuration(durationSec),
  }
}

function decodeAuthor(entry: YtDlpEntry): string {
  return entry.uploader ?? entry.channel ?? entry.uploader_id ?? entry.channel_id ?? "Unknown Channel"
}

export function formatDuration(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec))
  const minute = Math.floor(clamped / 60)
  const second = clamped % 60
  return `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
}

function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", (error) => {
      reject(new SearchServiceError(`failed to start yt-dlp: ${error.message}`))
    })

    child.on("close", (code) => {
      if (code !== 0) {
        const message = stderr.trim() || `yt-dlp exited with code ${code}`
        reject(new SearchServiceError(message))
        return
      }

      resolve(stdout)
    })
  })
}
