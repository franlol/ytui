import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Socket } from "node:net"
import { execFile, spawn, type ChildProcess } from "node:child_process"
import type { PlaybackService, PlaybackSession, PlaybackSource } from "./playback.service.types"

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
  private currentSession: PlaybackSession | null = null
  private currentRoute: AudioRoute | null = null

  constructor(private readonly binaryPath = "mpv") {}

  async play(source: PlaybackSource): Promise<PlaybackSession> {
    await this.stop()

    const sessionId = randomUUID()
    this.currentRoute = await createAudioRoute(sessionId)

    const ipcPath = join(tmpdir(), `ytui-mpv-${process.pid}-${randomUUID()}.sock`)
    const args = [
      "--no-video",
      "--really-quiet",
      `--input-ipc-server=${ipcPath}`,
      ...(this.currentRoute ? [`--audio-device=pulse/${this.currentRoute.sinkName}`] : []),
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
    this.currentSession = {
      id: sessionId,
      visualizerSource: this.currentRoute?.monitorSource ?? null,
    }

    try {
      await this.waitForPlaybackReady()
    } catch (error) {
      await this.stop()
      throw error
    }

    child.once("exit", () => {
      this.process = null
      this.currentSession = null
      void this.cleanupSocketFile()
      void this.cleanupAudioRoute()
    })

    return this.currentSession
  }

  async pause(): Promise<void> {
    await this.sendCommand(["set_property", "pause", true])
  }

  async resume(): Promise<void> {
    await this.sendCommand(["set_property", "pause", false])
  }

  async seekTo(seconds: number): Promise<void> {
    const target = Math.max(0, Math.round(seconds))
    await this.sendCommand(["seek", target, "absolute"])
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
    this.currentSession = null
    await this.cleanupSocketFile()
    await this.cleanupAudioRoute()
  }

  getCurrentSession(): PlaybackSession | null {
    return this.currentSession
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

  private async cleanupAudioRoute(): Promise<void> {
    const route = this.currentRoute
    this.currentRoute = null
    if (!route) {
      return
    }

    if (route.loopbackModuleId) {
      await unloadModule(route.loopbackModuleId)
    }

    if (route.sinkModuleId) {
      await unloadModule(route.sinkModuleId)
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

type AudioRoute = {
  sinkName: string
  monitorSource: string
  sinkModuleId: string | null
  loopbackModuleId: string | null
}

async function createAudioRoute(sessionId: string): Promise<AudioRoute | null> {
  if (process.platform !== "linux") {
    return null
  }

  const sinkName = `ytui_${sessionId.replace(/-/g, "")}`
  let sinkModuleId: string | null = null
  let loopbackModuleId: string | null = null

  try {
    sinkModuleId = await runPactl(["load-module", "module-null-sink", `sink_name=${sinkName}`])
    if (!sinkModuleId) {
      return null
    }

    const defaultSink = (await runPactl(["get-default-sink"])) || "@DEFAULT_SINK@"
    loopbackModuleId =
      (await runPactl(["load-module", "module-loopback", `source=${sinkName}.monitor`, `sink=${defaultSink}`, "latency_msec=60"])) || null

    return {
      sinkName,
      monitorSource: `${sinkName}.monitor`,
      sinkModuleId,
      loopbackModuleId,
    }
  } catch {
    if (loopbackModuleId) {
      await unloadModule(loopbackModuleId)
    }
    if (sinkModuleId) {
      await unloadModule(sinkModuleId)
    }
    return null
  }
}

async function unloadModule(id: string): Promise<void> {
  try {
    await runPactl(["unload-module", id])
  } catch {
    // best effort cleanup
  }
}

function runPactl(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("pactl", args, { encoding: "utf8" }, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }

      resolve(stdout.trim())
    })
  })
}
