import type { CavaPanelProps } from "./cava-panel.types"

export function CavaPanel(props: CavaPanelProps) {
  const rendered = generateCava(props.width, props.lines, props.phase)

  return (
    <box
      {...(props.fill ? {} : { height: Math.max(3, props.lines + 2) })}
      borderStyle="single"
      borderColor={props.theme.border}
      title="CAVA"
      backgroundColor={props.theme.panel}
      padding={1}
      {...(props.fill ? { flexGrow: 1 } : {})}
    >
      {rendered.map((line, index) => (
        <text key={`${index}:${line.length}`} content={line} fg={props.theme.accent} />
      ))}
    </box>
  )
}

function generateCava(width: number, lines: number, phase: number): string[] {
  const blocks = [" ", ".", ":", "=", "+", "*", "#", "%", "@"]
  const out: string[] = []

  for (let row = 0; row < lines; row += 1) {
    let line = ""
    for (let x = 0; x < width; x += 1) {
      const waveA = Math.sin((x + phase * 2 + row * 3) / 6)
      const waveB = Math.sin((x + phase + row * 5) / 11)
      const value = (waveA + waveB + 2) / 4
      const index = Math.max(0, Math.min(blocks.length - 1, Math.floor(value * (blocks.length - 1))))
      line += blocks[index]
    }
    out.push(line)
  }

  return out
}
