import { readdir, readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type { PluginManifest } from "../../../types/plugin.types"
import type { PluginLoadResult } from "./plugin-loader.types"

const PLUGIN_DIR = join(homedir(), ".config", "ytui", "plugins")

export async function loadPluginManifests(enabledPluginIds: string[]): Promise<PluginLoadResult[]> {
  try {
    const entries = await readdir(PLUGIN_DIR, { withFileTypes: true })
    const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)

    const manifests = await Promise.all(
      directories.map(async (directory): Promise<PluginLoadResult> => {
        const manifestPath = join(PLUGIN_DIR, directory, "plugin.json")
        try {
          const raw = await readFile(manifestPath, "utf8")
          const parsed = JSON.parse(raw) as Partial<PluginManifest>
          const manifest = validateManifest(parsed)
          return {
            manifest,
            enabled: enabledPluginIds.includes(manifest.id),
          }
        } catch (error) {
          return {
            manifest: {
              id: directory,
              name: directory,
              version: "0.0.0",
              description: "",
              apiVersion: "1.0.0",
              entry: "main.mjs",
            },
            enabled: false,
            error: error instanceof Error ? error.message : "Invalid plugin manifest",
          }
        }
      }),
    )

    return manifests
  } catch {
    return []
  }
}

function validateManifest(input: Partial<PluginManifest>): PluginManifest {
  if (!input.id) {
    throw new Error("Manifest missing 'id'")
  }
  if (!input.name) {
    throw new Error("Manifest missing 'name'")
  }
  if (!input.version) {
    throw new Error("Manifest missing 'version'")
  }
  if (!input.description) {
    throw new Error("Manifest missing 'description'")
  }
  if (!input.apiVersion) {
    throw new Error("Manifest missing 'apiVersion'")
  }
  if (!input.entry) {
    throw new Error("Manifest missing 'entry'")
  }

  return {
    id: input.id,
    name: input.name,
    version: input.version,
    description: input.description,
    author: input.author,
    apiVersion: input.apiVersion,
    entry: input.entry,
  }
}
