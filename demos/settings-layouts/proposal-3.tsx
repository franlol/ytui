/**
 * PROPOSAL 3 — Single grouped scrolling form
 *
 *   bun run src/demos/settings-layouts/proposal-3.tsx
 *
 * All settings in one flat list, grouped under section headers.
 * No category split — every setting is visible from the start.
 * Section headers are visual dividers only (not selectable).
 *
 * Navigation:
 *   j / k    move down / up
 *   ← / →   change selected value
 *   Space    toggle (for toggle settings)
 *   q        quit
 */
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useMemo, useState } from "react"
import {
  CATEGORIES,
  INITIAL_SETTINGS,
  changeValue,
  theme,
  widget,
  type DemoSetting,
} from "./shared"

const LABEL_W = 20
const WIDGET_W = 20

type FlatRow =
  | { kind: "header"; label: string }
  | { kind: "item"; setting: DemoSetting; selectableIdx: number }

function buildFlatRows(settings: DemoSetting[]): FlatRow[] {
  const rows: FlatRow[] = []
  let selectableIdx = -1
  let prevCategory = ""

  for (const s of settings) {
    if (s.category !== prevCategory) {
      prevCategory = s.category
      rows.push({ kind: "header", label: s.category })
    }
    selectableIdx++
    rows.push({ kind: "item", setting: s, selectableIdx })
  }
  return rows
}

function App(props: { requestQuit: () => void }) {
  const { width, height } = useTerminalDimensions()
  const [flatIndex, setFlatIndex] = useState(0)
  const [settings, setSettings] = useState(INITIAL_SETTINGS)

  const totalSelectable = settings.length

  const flatRows = useMemo(() => buildFlatRows(settings), [settings])

  function selectedId(): string | undefined {
    return settings[flatIndex]?.id
  }

  function applyChange(dir: 1 | -1) {
    const id = selectedId()
    if (!id) return
    setSettings((prev) => prev.map((s) => (s.id === id ? changeValue(s, dir) : s)))
  }

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") return props.requestQuit()
    if (key.name === "j" || key.name === "down")
      return setFlatIndex((i) => Math.min(totalSelectable - 1, i + 1))
    if (key.name === "k" || key.name === "up")
      return setFlatIndex((i) => Math.max(0, i - 1))
    if (key.name === "right") return applyChange(1)
    if (key.name === "left") return applyChange(-1)
    if (key.name === "space") return applyChange(1)
  })

  // Scroll the flat list to keep the selected item visible.
  // Each item row is 1 line; each header is 1 line; account for borders.
  const panelHeight = Math.max(6, height - 4)
  const innerHeight = Math.max(1, panelHeight - 2)

  // Build visible window: count all rows (headers + items) and window them.
  const allRenderRows = flatRows
  const totalRows = allRenderRows.length
  // Find row index of selected item in the flat list.
  const selectedRowIdx = allRenderRows.findIndex(
    (r) => r.kind === "item" && r.selectableIdx === flatIndex,
  )
  const winStart = Math.max(
    0,
    Math.min(
      selectedRowIdx - Math.floor(innerHeight / 2),
      Math.max(0, totalRows - innerHeight),
    ),
  )
  const visibleRows = allRenderRows.slice(winStart, winStart + innerHeight)

  const rendered = visibleRows.map((row, i) => {
    if (row.kind === "header") {
      return (
        <box key={`h-${row.label}`} flexDirection="row" backgroundColor={theme.panel}>
          <text
            content={`  ▌ ${row.label.toUpperCase()}`}
            fg={theme.accent}
            bg={theme.panel}
          />
        </box>
      )
    }

    const sel = row.selectableIdx === flatIndex
    const fg = sel ? theme.accent : theme.text
    const bg = sel ? theme.selectedBg : theme.panel
    const wfg = sel ? theme.text : theme.muted
    return (
      <box key={row.setting.id} flexDirection="column" backgroundColor={bg}>
        <box flexDirection="row" backgroundColor={bg}>
          <text content={`  ${sel ? ">" : " "} ${row.setting.label.padEnd(LABEL_W)}`} fg={fg} bg={bg} />
          <text content={widget(row.setting, WIDGET_W)} fg={wfg} bg={bg} />
        </box>
        <text content={`      ${row.setting.description}`} fg={theme.muted} bg={bg} />
      </box>
    )
  })

  // Scroll indicator
  const pct = totalRows <= innerHeight ? 100 : Math.round((winStart / (totalRows - innerHeight)) * 100)
  const scrollInfo = totalRows > innerHeight ? `  ${pct}%` : ""

  return (
    <box width="100%" height="100%" flexDirection="column" backgroundColor={theme.bg} padding={1}>
      <text
        content="  PROPOSAL 3 — Single grouped form  "
        fg={theme.bg}
        bg={theme.accent}
      />

      <box flexGrow={1} paddingTop={1} paddingBottom={1}>
        <box
          height={panelHeight}
          borderStyle="single"
          borderColor={theme.accent}
          title={`SETTINGS${scrollInfo}`}
          backgroundColor={theme.panel}
          paddingLeft={0}
          paddingRight={0}
        >
          <box flexDirection="column" height={innerHeight}>
            {rendered}
          </box>
        </box>
      </box>

      <text
        content="j/k  move   ←/→  change value   Space  toggle   q quit"
        fg={theme.muted}
        bg={theme.bg}
      />
    </box>
  )
}

const renderer = await createCliRenderer({ exitOnCtrlC: true, useMouse: false })
const root = createRoot(renderer as any)
root.render(
  <App
    requestQuit={() => {
      root.unmount()
      renderer.destroy()
      process.exit(0)
    }}
  />,
)
