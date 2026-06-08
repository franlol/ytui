/**
 * PROPOSAL 1 — Master-detail with two focus areas
 *
 *   bun run src/demos/settings-layouts/proposal-1.tsx
 *
 * Left pane holds the category list; right pane holds setting rows.
 * Two independent focus areas (matches the real app's current structure),
 * but each setting row shows its control widget inline:
 *   enums  →  ‹ value ›      (cycle with ←/→)
 *   toggles →  [● on ]       (flip with ←/→ or Space)
 *   numbers →  ████░░  4     (adjust with ←/→, shown as a progress track)
 *
 * Navigation:
 *   j / k          move within focused pane
 *   Tab / Enter / l  focus: categories → items
 *   h / Escape       focus: items → categories
 *   ← / →          change value (only when items pane is focused)
 *   q              quit
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

const LABEL_W = 18
const WIDGET_W = 18
const CAT_W = 22

type Focus = "categories" | "items"

function CategoryPane(props: {
  focused: boolean
  categoryIndex: number
}) {
  const { focused, categoryIndex } = props
  return (
    <box
      width={CAT_W}
      borderStyle="single"
      borderColor={focused ? theme.accent : theme.border}
      title="SETTINGS"
      backgroundColor={theme.panel}
    >
      <box flexDirection="column">
        {CATEGORIES.map((c, i) => {
          const sel = i === categoryIndex
          const fg = sel ? (focused ? theme.accent : theme.text) : theme.muted
          const bg = sel ? theme.selectedBg : theme.panel
          return (
            <text
              key={c}
              content={`${sel ? "›" : " "} ${c}`}
              fg={fg}
              bg={bg}
            />
          )
        })}
      </box>
    </box>
  )
}

function ItemPane(props: {
  focused: boolean
  category: string
  items: DemoSetting[]
  itemIndex: number
  innerHeight: number
}) {
  const { focused, category, items, itemIndex, innerHeight } = props

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
      borderColor={focused ? theme.accent : theme.border}
      title={category.toUpperCase()}
      backgroundColor={theme.panel}
      paddingLeft={1}
      paddingRight={1}
    >
      <box flexDirection="column" height={innerHeight}>
        {visible.map((s, i) => {
          const absIdx = scrollStart + i
          const sel = absIdx === itemIndex
          const fg = sel ? (focused ? theme.accent : theme.text) : theme.text
          const bg = sel ? theme.selectedBg : theme.panel
          const wfg = sel ? (focused ? theme.text : theme.muted) : theme.muted
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
  const [focus, setFocus] = useState<Focus>("categories")
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

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") {
      if (focus === "items") return setFocus("categories")
      return props.requestQuit()
    }

    if (focus === "categories") {
      if (key.name === "j" || key.name === "down")
        return setCategoryIndex((i) => Math.min(CATEGORIES.length - 1, i + 1))
      if (key.name === "k" || key.name === "up")
        return setCategoryIndex((i) => Math.max(0, i - 1))
      if (key.name === "l" || key.name === "return" || key.name === "tab") {
        setItemIndex(0)
        return setFocus("items")
      }
    } else {
      if (key.name === "j" || key.name === "down")
        return setItemIndex((i) => Math.min(Math.max(0, items.length - 1), i + 1))
      if (key.name === "k" || key.name === "up")
        return setItemIndex((i) => Math.max(0, i - 1))
      if (key.name === "h") return setFocus("categories")
      if (key.name === "right") return applyChange(1)
      if (key.name === "left") return applyChange(-1)
      if (key.name === "space") return applyChange(1)
    }
  })

  const panelHeight = Math.max(6, height - 4)
  const innerHeight = Math.max(1, panelHeight - 2)

  return (
    <box width="100%" height="100%" flexDirection="column" backgroundColor={theme.bg} padding={1}>
      <text
        content="  PROPOSAL 1 — Master-detail (two focus areas)  "
        fg={theme.bg}
        bg={theme.accent}
      />

      <box flexGrow={1} paddingTop={1} paddingBottom={1}>
        <box height={panelHeight} flexDirection="row" gap={1}>
          <CategoryPane focused={focus === "categories"} categoryIndex={categoryIndex} />
          <ItemPane
            focused={focus === "items"}
            category={category}
            items={items}
            itemIndex={itemIndex}
            innerHeight={innerHeight}
          />
        </box>
      </box>

      <text
        content={
          focus === "categories"
            ? "j/k move category   l/Enter/Tab → items   q quit"
            : "j/k move item   ←/→ change value   h/Esc → categories"
        }
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
