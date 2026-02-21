import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Socket } from "node:net"
import { spawn, type ChildProcess } from "node:child_process"
import type { PlaybackService, PlaybackSource } from "./playback.service.types"

const DEFAULT_TIMEOUT_MS = 10000

export class PlaybackServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PlaybackServiceError"
  }
}

export class MpvPlaybackService implements PlaybackService {
  private process: ChildProcess | null = null
  private ipcPath: string | null = null

  constructor(private readonly binaryPath = "mpv") {}

  async play(source: PlaybackSource): Promise<void> {
    await this.stop()

    const ipcPath = join(tmpdir(), `ytui-mpv-${process.pid}-${randomUUID()}.sock`)
    const args = [
      "--no-video",
      "--really-quiet",
      `--input-ipc-server=${ipcPath}`,
      source.url,
    ]

    const child = spawn(this.binaryPath, args, { stdio: ["ignore", "pipe", "pipe"] })

    let stderr = ""
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        cleanup()
        reject(new PlaybackServiceError(`failed to start mpv: ${error.message}`))
      }

      const onExit = () => {
        cleanup()
        const message = stderr.trim() || "mpv exited before playback started"
        reject(new PlaybackServiceError(message))
      }

      const cleanup = () => {
        child.off("error", onError)
        child.off("exit", onExit)
      }

      child.once("error", onError)
      child.once("exit", onExit)

      waitForFile(ipcPath, DEFAULT_TIMEOUT_MS)
        .then(() => {
          cleanup()
          resolve()
        })
        .catch((error) => {
          cleanup()
          reject(error)
        })
    })

    this.process = child
    this.ipcPath = ipcPath

    try {
      await this.waitForPlaybackReady()
    } catch (error) {
      await this.stop()
      throw error
    }

    child.once("exit", () => {
      this.process = null
      void this.cleanupSocketFile()
    })
  }

  async pause(): Promise<void> {
    await this.sendCommand(["set_property", "pause", true])
  }

  async resume(): Promise<void> {
    await this.sendCommand(["set_property", "pause", false])
  }

  async stop(): Promise<void> {
    if (!this.process) {
      await this.cleanupSocketFile()
      return
    }

    try {
      await this.sendCommand(["quit"], 500)
    } catch {
      // best effort, process may already be gone
    }

    if (this.process && !this.process.killed) {
      this.process.kill("SIGTERM")
    }

    this.process = null
    await this.cleanupSocketFile()
  }

  private async sendCommand(command: unknown[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<void> {
    const response = await this.sendCommandAndRead(command, timeoutMs)
    if (response.error && response.error !== "success") {
      throw new PlaybackServiceError(`mpv command failed: ${response.error}`)
    }
  }

  private async sendCommandAndRead(command: unknown[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<{ error?: string; data?: unknown }> {
    if (!this.ipcPath) {
      throw new PlaybackServiceError("playback process not started")
    }
    const ipcPath = this.ipcPath

    const payload = JSON.stringify({ command }) + "\n"

    return await new Promise<{ error?: string; data?: unknown }>((resolve, reject) => {
      const socket = new Socket()
      let settled = false
      let response = ""

      const finish = (error?: Error) => {
        if (settled) {
          return
        }
        settled = true
        socket.destroy()

        if (error) {
          reject(error)
          return
        }

        if (!response.trim()) {
          resolve({ error: "success" })
          return
        }

        try {
          const parsed = JSON.parse(response.trim()) as { error?: string; data?: unknown }
          resolve(parsed)
        } catch {
          resolve({ error: "success" })
        }
      }

      const timer = setTimeout(() => {
        finish(new PlaybackServiceError("timed out communicating with mpv"))
      }, timeoutMs)

      socket.once("error", (error) => {
        clearTimeout(timer)
        finish(new PlaybackServiceError(`mpv ipc error: ${error.message}`))
      })

      socket.connect(ipcPath, () => {
        socket.write(payload)
      })

      socket.on("data", (chunk) => {
        response += String(chunk)
        if (response.includes("\n")) {
          clearTimeout(timer)
          finish()
        }
      })

      socket.on("close", () => {
        clearTimeout(timer)
        finish()
      })
    })
  }

  private async waitForPlaybackReady(): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < DEFAULT_TIMEOUT_MS) {
      try {
        const idle = await this.getProperty<boolean>("idle-active")
        if (idle) {
          await new Promise((resolve) => setTimeout(resolve, 80))
          continue
        }

        const audioParams = await this.getProperty<Record<string, unknown>>("audio-params")
        if (audioParams && typeof audioParams === "object" && Object.keys(audioParams).length > 0) {
          return
        }
      } catch {
        // keep polling while player is starting
      }

      await new Promise((resolve) => setTimeout(resolve, 80))
    }

    throw new PlaybackServiceError("mpv did not report active audio playback")
  }

  private async getProperty<T>(name: string): Promise<T | null> {
    const response = await this.sendCommandAndRead(["get_property", name], 1500)
    if (response.error === "success") {
      return (response.data as T) ?? null
    }

    if (response.error === "property unavailable") {
      return null
    }

    throw new PlaybackServiceError(`mpv property read failed: ${response.error ?? "unknown"}`)
  }

  private async cleanupSocketFile(): Promise<void> {
    if (!this.ipcPath) {
      return
    }

    const path = this.ipcPath
    this.ipcPath = null

    try {
      if (existsSync(path)) {
        await rm(path)
      }
    } catch {
      // best effort cleanup
    }
  }
}

async function waitForFile(path: string, timeoutMs: number): Promise<void> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (existsSync(path)) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  throw new PlaybackServiceError("mpv IPC socket did not become ready")
}
