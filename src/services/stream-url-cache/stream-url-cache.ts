import { spawn } from "node:child_process"
import type { StreamUrlCacheEntry } from "./stream-url-cache.types"

const TTL_MS = 4 * 60 * 60 * 1000
const MAX_CONCURRENT = 3

export class StreamUrlCache {
  private entries = new Map<string, StreamUrlCacheEntry>()
  private inflight = new Map<string, Promise<string>>()
  private queue: string[] = []
  private active = 0

  private readonly ytDlpPath: string

  constructor(ytDlpPath = "yt-dlp") {
    this.ytDlpPath = ytDlpPath
  }

  get(trackId: string): string | null {
    const entry = this.entries.get(trackId)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(trackId)
      return null
    }
    return entry.url
  }

  evict(trackId: string): void {
    this.entries.delete(trackId)
    this.inflight.delete(trackId)
  }

  async resolve(trackId: string): Promise<string> {
    const cached = this.get(trackId)
    if (cached) return cached

    const existing = this.inflight.get(trackId)
    if (existing) return existing

    const promise = this.fetchUrl(trackId).then((url) => {
      this.entries.set(trackId, { url, expiresAt: Date.now() + TTL_MS })
      this.inflight.delete(trackId)
      return url
    }).catch((err) => {
      this.inflight.delete(trackId)
      throw err
    })

    this.inflight.set(trackId, promise)
    return promise
  }

  prefetch(trackIds: string[]): void {
    for (const id of trackIds) {
      if (!this.entries.has(id) && !this.inflight.has(id) && !this.queue.includes(id)) {
        this.queue.push(id)
      }
    }
    this.drain()
  }

  private drain(): void {
    while (this.active < MAX_CONCURRENT && this.queue.length > 0) {
      const id = this.queue.shift()!
      this.active++
      this.resolve(id)
        .catch(() => { /* prefetch failures are silent */ })
        .finally(() => {
          this.active--
          this.drain()
        })
    }
  }

  protected fetchUrl(trackId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = `https://www.youtube.com/watch?v=${trackId}`
      const child = spawn(this.ytDlpPath, [
        "-f", "bestaudio/best",
        "--get-url",
        "--no-playlist",
        "--no-warnings",
        url,
      ], { stdio: ["ignore", "pipe", "pipe"] })

      let stdout = ""
      let stderr = ""

      child.stdout.on("data", (chunk) => { stdout += String(chunk) })
      child.stderr.on("data", (chunk) => { stderr += String(chunk) })

      child.on("error", (err) => reject(new Error(`yt-dlp spawn failed: ${err.message}`)))

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr.trim() || `yt-dlp exited with code ${String(code)}`))
          return
        }
        const streamUrl = stdout.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0)
        if (!streamUrl) {
          reject(new Error("yt-dlp returned no URL"))
          return
        }
        resolve(streamUrl)
      })
    })
  }
}
