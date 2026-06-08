/**
 * PROPOSAL 2 — Horizontal tab strip + content pane
 *
 *   bun run src/demos/settings-layouts/proposal-2.tsx
 *
 * Categories are rendered as a horizontal tab strip across the top.
 * The full terminal width is available to setting rows.
 * Single focus area — no pane-switching needed.
 *
 * Navigation:
 *   h / [    previous category tab
 *   l / ]    next category tab
 *   j / k    move up / down within the current category
 *   ← / →   change selected value
 *   Space    toggle (for toggle settings)
 *   q        quit
 */
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useState } from "react"
import {
  CATEGORIES,
  INITIAL_SETTINGS,
  changeValue,
  theme,
  widget,
  type DemoSetting,
} from "./shared"

const LABEL_W = 20
const WIDGET_W = 22

function TabStrip(props: { categoryIndex: number; width: number }) {
  const { categoryIndex } = props
  return (
    <box flexDirection="row">
      {CATEGORIES.map((c, i) => {
        const sel = i === categoryIndex
        return (
          <box
            key={c}
            borderStyle="single"
            borderColor={sel ? theme.accent : theme.border}
            backgroundColor={sel ? theme.selectedBg : theme.panel}
            paddingLeft={1}
            paddingRight={1}
          >
            <text
              content={c}
              fg={sel ? theme.accent : theme.muted}
              bg={sel ? theme.selectedBg : theme.panel}
            />
          </box>
        )
      })}
      <box flexGrow={1} backgroundColor={theme.bg}>
        <text content="" fg={theme.bg} bg={theme.bg} />
      </box>
    </box>
  )
}

function ContentPane(props: {
  category: string
  items: DemoSetting[]
  itemIndex: number
  innerHeight: number
}) {
  const { category, items, itemIndex, innerHeight } = props

  const rowsPerItem = 2
  const maxVisible = Math.max(1, Math.floor(innerHeight / rowsPerItem))
  const scrollStart = Math.max(
    0,
    Math.min(itemIndex - Math.floor(maxVisible / 2), Math.max(0, items.length - maxVisible)),
  )
  const visible = items.slice(scrollStart, scrollStart + maxVisible)

  return (
    <box
      flexGrow={1}
      borderStyle="single"
      borderColor={theme.accent}
      title={category.toUpperCase()}
      backgroundColor={theme.panel}
      paddingLeft={1}
      paddingRight={1}
    >
      <box flexDirection="column" height={innerHeight}>
        {visible.map((s, i) => {
          const absIdx = scrollStart + i
          const sel = absIdx === itemIndex
          const fg = sel ? theme.accent : theme.text
          const bg = sel ? theme.selectedBg : theme.panel
          const wfg = sel ? theme.text : theme.muted
          return (
            <box key={s.id} flexDirection="column" backgroundColor={bg}>
              <box flexDirection="row" backgroundColor={bg}>
                <text content={`${sel ? ">" : " "} ${s.label.padEnd(LABEL_W)}`} fg={fg} bg={bg} />
                <text content={widget(s, WIDGET_W)} fg={wfg} bg={bg} />
              </box>
              <text content={`   ${s.description}`} fg={theme.muted} bg={bg} />
            </box>
          )
        })}
        {items.length === 0 && (
          <text content="  No settings in this category." fg={theme.muted} bg={theme.panel} />
        )}
      </box>
    </box>
  )
}

function App(props: { requestQuit: () => void }) {
  const { width, height } = useTerminalDimensions()
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [itemIndex, setItemIndex] = useState(0)
  const [settings, setSettings] = useState(INITIAL_SETTINGS)

  const category = CATEGORIES[categoryIndex]!
  const items = settings.filter((s) => s.category === category)

  function applyChange(dir: 1 | -1) {
    const id = items[itemIndex]?.id
    if (!id) return
    setSettings((prev) => prev.map((s) => (s.id === id ? changeValue(s, dir) : s)))
  }

  function prevTab() {
    setItemIndex(0)
    setCategoryIndex((i) => (i - 1 + CATEGORIES.length) % CATEGORIES.length)
  }

  function nextTab() {
    setItemIndex(0)
    setCategoryIndex((i) => (i + 1) % CATEGORIES.length)
  }

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") return props.requestQuit()
    // h/[ → prev tab,  l/] → next tab  (check both key.name and key.sequence)
    if (key.name === "h" || key.name === "[" || key.sequence === "[") return prevTab()
    if (key.name === "l" || key.name === "]" || key.sequence === "]") return nextTab()
    if (key.name === "j" || key.name === "down")
      return setItemIndex((i) => Math.min(Math.max(0, items.length - 1), i + 1))
    if (key.name === "k" || key.name === "up")
      return setItemIndex((i) => Math.max(0, i - 1))
    if (key.name === "right") return applyChange(1)
    if (key.name === "left") return applyChange(-1)
    if (key.name === "space") return applyChange(1)
  })

  const tabHeight = 3
  const statusHeight = 1
  const gapRows = 2
  const panelHeight = Math.max(4, height - tabHeight - statusHeight - gapRows - 2)
  const innerHeight = Math.max(1, panelHeight - 2)

  return (
    <box width="100%" height="100%" flexDirection="column" backgroundColor={theme.bg} padding={1}>
      <text
        content="  PROPOSAL 2 — Horizontal tab strip  "
        fg={theme.bg}
        bg={theme.accent}
      />

      <box paddingTop={1} paddingBottom={1} flexDirection="column" gap={0}>
        <TabStrip categoryIndex={categoryIndex} width={width - 2} />
        <ContentPane
          category={category}
          items={items}
          itemIndex={itemIndex}
          innerHeight={innerHeight}
        />
      </box>

      <text
        content="h/l or [/]  switch tab   j/k  move item   ←/→  change value   q quit"
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
