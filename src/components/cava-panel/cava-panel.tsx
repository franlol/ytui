import type { CavaPanelProps } from "./cava-panel.types"

export function CavaPanel(props: CavaPanelProps) {
  const chromeCols = 4
  const chromeRows = 3
  const targetWidth = Math.max(6, props.width)
  const contentWidth = Math.max(1, targetWidth - chromeCols)
  const contentLines = Math.max(1, props.lines)
  const panelHeight = Math.max(5, contentLines + chromeRows)
  const rendered = renderBars(contentWidth, contentLines, props.bars, props.ramp)

  return (
    <box
      {...(props.fill ? { flexGrow: 1, width: "100%" } : { width: "100%", height: panelHeight })}
      borderStyle="single"
      borderColor={props.theme.border}
      title="CAVA"
      backgroundColor={props.theme.panel}
      paddingTop={1}
      paddingLeft={1}
      paddingRight={1}
    >
      {rendered.map((line, index) => (
        <text key={`${index}:${line.length}`} content={line} fg={props.theme.accent} />
      ))}
    </box>
  )
}

function renderBars(width: number, lines: number, bars: number[], ramp: string[]): string[] {
  const out: string[] = []
  const safeWidth = Math.max(1, width)
  const safeLines = Math.max(1, lines)
  const normalized = bars.length > 0 ? bars : new Array(64).fill(0)
  const framePeak = Math.max(1, ...normalized)
  const safeRamp = ramp.length >= 2 ? ramp : [" ", "#"]
  const levelsPerRow = safeRamp.length - 1

  for (let row = 0; row < safeLines; row += 1) {
    let line = ""
    const rowFromBottom = safeLines - row - 1
    for (let x = 0; x < safeWidth; x += 1) {
      const sourceIndex = Math.floor((x / safeWidth) * normalized.length)
      const units = mapBarToUnits(normalized[sourceIndex] ?? 0, safeLines, framePeak, levelsPerRow)
      const rowUnits = units - rowFromBottom * levelsPerRow
      line += resolveGlyph(rowUnits, safeRamp)
    }
    out.push(line)
  }

  return out
}

function mapBarToUnits(bar: number, lines: number, maxBar: number, levelsPerRow: number): number {
  const clamped = Math.max(0, bar)
  const maxUnits = lines * levelsPerRow
  return Math.round((clamped / maxBar) * maxUnits)
}

function resolveGlyph(units: number, ramp: string[]): string {
  if (units <= 0) {
    return ramp[0]
  }

  const maxUnit = ramp.length - 1
  if (units >= maxUnit) {
    return ramp[maxUnit]
  }

  return ramp[units] ?? ramp[0]
}
