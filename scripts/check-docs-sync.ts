import { existsSync } from "node:fs"
import { execSync } from "node:child_process"

const IMPORTANT_PREFIXES = [
  "src/components/",
  "src/layouts/",
  "src/features/",
  "src/services/",
  "src/registries/",
  "src/state/",
  "AGENTS.md",
]

const DOCS_PREFIX = "docs/"
const OPENCODE_PREFIX = ".opencode/"

function run(command: string): string {
  return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
}

function getChangedFiles(): string[] {
  if (!existsSync(".git")) {
    return []
  }

  const baseRef = process.env.GITHUB_BASE_REF
  try {
    if (baseRef) {
      try {
        run(`git fetch --depth=1 origin ${baseRef}`)
      } catch {
        // no-op
      }
      const output = run(`git diff --name-only --diff-filter=ACMR origin/${baseRef}...HEAD`)
      return output ? output.split("\n").filter(Boolean) : []
    }
  } catch {
    // fallback below
  }

  try {
    const output = run("git diff --name-only --diff-filter=ACMR HEAD~1..HEAD")
    return output ? output.split("\n").filter(Boolean) : []
  } catch {
    const output = run("git diff --name-only --diff-filter=ACMR")
    return output ? output.split("\n").filter(Boolean) : []
  }
}

function isImportant(path: string): boolean {
  return IMPORTANT_PREFIXES.some((prefix) => path.startsWith(prefix) || path === prefix)
}

function isDocs(path: string): boolean {
  return path.startsWith(DOCS_PREFIX)
}

function isOpenCodeDefinition(path: string): boolean {
  return path.startsWith(OPENCODE_PREFIX)
}

function main() {
  if (process.env.BREAK_GLASS === "true") {
    console.log("[docs-sync] BREAK_GLASS=true, skipping docs sync check")
    process.exit(0)
  }

  const changedFiles = getChangedFiles()
  const importantChanged = changedFiles.filter(isImportant)
  const docsChanged = changedFiles.filter(isDocs)
  const runtimeChanged = changedFiles.filter(isOpenCodeDefinition)

  if (importantChanged.length === 0) {
    console.log("[docs-sync] No important code changes detected")
    process.exit(0)
  }

  if (docsChanged.length === 0 && runtimeChanged.length === 0) {
    console.error("[docs-sync] FAIL: important code changes detected without docs or .opencode updates")
    console.error("[docs-sync] Important files:")
    for (const file of importantChanged) {
      console.error(` - ${file}`)
    }
    console.error("[docs-sync] Update corresponding files under docs/ and/or .opencode/ and rerun.")
    process.exit(1)
  }

  console.log("[docs-sync] PASS: important code changes include docs/runtime definition updates")
  console.log("[docs-sync] Important files:")
  for (const file of importantChanged) {
    console.log(` - ${file}`)
  }
  console.log("[docs-sync] Docs files:")
  for (const file of docsChanged) {
    console.log(` - ${file}`)
  }
  console.log("[docs-sync] .opencode files:")
  for (const file of runtimeChanged) {
    console.log(` - ${file}`)
  }
}

main()
