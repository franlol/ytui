import type { ProgressStyleDefinition } from "./progress-style.registry.types"

export class ProgressStyleRegistry {
  private definitions = new Map<string, ProgressStyleDefinition>()

  register(definition: ProgressStyleDefinition) {
    this.definitions.set(definition.id, definition)
  }

  get(styleId: string): ProgressStyleDefinition | undefined {
    return this.definitions.get(styleId)
  }

  list(): ProgressStyleDefinition[] {
    return Array.from(this.definitions.values())
  }
}

export function createDefaultProgressStyleRegistry(): ProgressStyleRegistry {
  const registry = new ProgressStyleRegistry()

  registry.register({
    id: "blocks",
    label: "Blocks",
    description: "Solid block bar",
    render: (ratio, width) => {
      const filled = Math.round(width * ratio)
      return `${"█".repeat(filled)}${"░".repeat(Math.max(0, width - filled))}`
    },
  })

  registry.register({
    id: "dots",
    label: "Dotline",
    description: "Minimal circular bar",
    render: (ratio, width) => {
      const filled = Math.round(width * ratio)
      return `${"●".repeat(filled)}${"○".repeat(Math.max(0, width - filled))}`
    },
  })

  registry.register({
    id: "braille",
    label: "Braille smooth",
    description: "Dense smooth braille ramp",
    render: (ratio, width) => {
      const ramp = ["⠀", "⢀", "⢠", "⢰", "⢸", "⣸", "⣾", "⣿"]
      const totalUnits = Math.max(0, Math.min(width * (ramp.length - 1), Math.round(ratio * width * (ramp.length - 1))))
      let out = ""

      for (let i = 0; i < width; i += 1) {
        const remaining = totalUnits - i * (ramp.length - 1)
        if (remaining <= 0) {
          out += ramp[0]
        } else if (remaining >= ramp.length - 1) {
          out += ramp[ramp.length - 1]
        } else {
          out += ramp[remaining]
        }
      }

      return out
    },
  })

  return registry
}
