import { randomUUID } from "node:crypto"
import { spawn, type ChildProcess } from "node:child_process"
import { rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { VisualizerErrorListener, VisualizerFrameListener, VisualizerService, VisualizerSession } from "./cava-visualizer.service.types"

export class CavaVisualizerService implements VisualizerService {
  private process: ChildProcess | null = null
  private configPath: string | null = null
  private activeSessionId: string | null = null

  constructor(private readonly binaryPath = "cava") {}

  async start(session: VisualizerSession, onFrame: VisualizerFrameListener, onError: VisualizerErrorListener): Promise<void> {
    await this.stop()

    if (process.platform !== "linux") {
      throw new Error("cava visualizer is currently supported on Linux only")
    }

    const configPath = join(tmpdir(), `ytui-cava-${randomUUID()}.conf`)
    this.configPath = configPath
    this.activeSessionId = session.id
    await writeFile(configPath, buildCavaConfig(session.source), "utf8")

    const child = spawn(this.binaryPath, ["-p", configPath], { stdio: ["ignore", "pipe", "pipe"] })
    this.process = child

    let stderr = ""
    let stdoutBuffer = ""
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += String(chunk)
      const lines = stdoutBuffer.split(/\r?\n/)
      stdoutBuffer = lines.pop() ?? ""
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) {
          continue
        }
        const bars = parseRawFrame(trimmed)
        if (bars.length > 0 && this.activeSessionId === session.id) {
          onFrame(bars)
        }
      }
    })

    child.once("error", (error) => {
      onError(`failed to start cava: ${error.message}`)
    })

    child.once("exit", (code) => {
      this.process = null
      if (this.activeSessionId === session.id && code !== 0) {
        const message = stderr.trim() || `cava exited with code ${String(code)}`
        onError(message)
      }
    })
  }

  async stop(): Promise<void> {
    if (this.process && !this.process.killed) {
      this.process.kill("SIGTERM")
    }
    this.process = null
    this.activeSessionId = null

    if (this.configPath) {
      const path = this.configPath
      this.configPath = null
      try {
        await rm(path)
      } catch {
        // best effort cleanup
      }
    }
  }
}

function buildCavaConfig(source: string): string {
  return [
    "[general]",
    "framerate = 60",
    "bars = 32",
    "autosens = 0",
    "sensitivity = 140",
    "noise_reduction = 70",
    "",
    "[input]",
    "method = pulse",
    `source = ${source}`,
    "",
    "[output]",
    "method = raw",
    "raw_target = /dev/stdout",
    "data_format = ascii",
    "ascii_max_range = 1000",
    "bar_delimiter = 59",
    "channels = mono",
    "",
  ].join("\n")
}

export function parseRawFrame(frame: string): number[] {
  return frame
    .split(";")
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value) && value >= 0)
}
