// Shared types, data, and helpers for all three settings layout demos.
// Throwaway — not imported by production code.

export const theme = {
  bg: "#1d2021",
  panel: "#282828",
  panelAlt: "#32302f",
  text: "#ebdbb2",
  muted: "#a89984",
  accent: "#fabd2f",
  border: "#665c54",
  selectedBg: "#504945",
}

export type SettingKind = "enum" | "toggle" | "number"

export type DemoSetting = {
  id: string
  category: string
  label: string
  description: string
  kind: SettingKind
  options?: string[]
  min?: number
  max?: number
  step?: number
  unit?: string
  value: string | boolean | number
}

export const CATEGORIES = ["Appearance", "Visualizer", "Behavior", "Providers", "Plugins"]

export const INITIAL_SETTINGS: DemoSetting[] = [
  {
    id: "theme",
    category: "Appearance",
    label: "Theme",
    description: "Active color scheme",
    kind: "enum",
    options: ["gruvbox", "nord", "matrix", "palenight"],
    value: "gruvbox",
  },
  {
    id: "progress",
    category: "Appearance",
    label: "Progress Style",
    description: "Player progress bar style",
    kind: "enum",
    options: ["blocks", "dots", "braille"],
    value: "blocks",
  },
  {
    id: "cava-on",
    category: "Visualizer",
    label: "CAVA Enabled",
    description: "Show audio visualizer below the player",
    kind: "toggle",
    value: true,
  },
  {
    id: "cava-h",
    category: "Visualizer",
    label: "CAVA Height",
    description: "Visualizer rows (1–8)",
    kind: "number",
    min: 1,
    max: 8,
    step: 1,
    value: 4,
  },
  {
    id: "cava-style",
    category: "Visualizer",
    label: "CAVA Style",
    description: "Visualizer glyph style",
    kind: "enum",
    options: ["bars", "blocks", "braille"],
    value: "bars",
  },
  {
    id: "cava-src",
    category: "Visualizer",
    label: "CAVA Source",
    description: "Audio capture mode",
    kind: "enum",
    options: ["ytui-strict", "ytui-best-effort", "system"],
    value: "ytui-strict",
  },
  {
    id: "mode",
    category: "Behavior",
    label: "Default Mode",
    description: "Mode on startup",
    kind: "enum",
    options: ["normal", "search", "zen", "library", "logs"],
    value: "normal",
  },
  {
    id: "limit",
    category: "Behavior",
    label: "Results Limit",
    description: "Max search results (10–100, step 5)",
    kind: "number",
    min: 10,
    max: 100,
    step: 5,
    value: 25,
  },
  {
    id: "timeout",
    category: "Behavior",
    label: "Status Timeout",
    description: "Status bar message duration (500–10000ms)",
    kind: "number",
    min: 500,
    max: 10000,
    step: 500,
    unit: "ms",
    value: 3000,
  },
  {
    id: "sidebar",
    category: "Behavior",
    label: "Sidebar Default",
    description: "Sidebar visibility on startup",
    kind: "toggle",
    value: true,
  },
  {
    id: "yt",
    category: "Providers",
    label: "YouTube",
    description: "yt-dlp backed provider  [active]",
    kind: "enum",
    options: ["active"],
    value: "active",
  },
]

export function changeValue(s: DemoSetting, dir: 1 | -1): DemoSetting {
  if (s.kind === "toggle") return { ...s, value: !(s.value as boolean) }
  if (s.kind === "number") {
    const min = s.min ?? 0
    const max = s.max ?? 100
    const step = s.step ?? 1
    return { ...s, value: Math.min(max, Math.max(min, (s.value as number) + dir * step)) }
  }
  const opts = s.options ?? []
  const idx = opts.indexOf(s.value as string)
  if (idx === -1) return s
  return { ...s, value: opts[(idx + dir + opts.length) % opts.length]! }
}

export function formatValue(s: DemoSetting): string {
  if (s.kind === "toggle") return (s.value as boolean) ? "on" : "off"
  if (s.kind === "number") return `${s.value}${s.unit ?? ""}`
  return String(s.value)
}

export function widget(s: DemoSetting, trackWidth: number): string {
  if (s.kind === "number") {
    const min = s.min ?? 0
    const max = s.max ?? 100
    const ratio = max === min ? 0 : ((s.value as number) - min) / (max - min)
    const filled = Math.round(ratio * trackWidth)
    const track = "█".repeat(filled) + "░".repeat(Math.max(0, trackWidth - filled))
    return `${track}  ${formatValue(s)}`
  }
  if (s.kind === "toggle") return (s.value as boolean) ? "[● on ]" : "[ off●]"
  return `‹ ${formatValue(s)} ›`
}
