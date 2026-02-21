import type { VisualizerStyleDefinition } from "./visualizer-style.registry.types"

const FALLBACK_STYLE_ID = "blocks"

export class VisualizerStyleRegistry {
  private definitions = new Map<string, VisualizerStyleDefinition>()

  register(definition: VisualizerStyleDefinition) {
    this.definitions.set(definition.id, normalizeDefinition(definition))
  }

  get(styleId: string): VisualizerStyleDefinition | undefined {
    return this.definitions.get(styleId)
  }

  getOrFallback(styleId: string, fallback = FALLBACK_STYLE_ID): VisualizerStyleDefinition {
    return this.definitions.get(styleId) ?? this.definitions.get(fallback) ?? createBuiltinStyles()[0]
  }

  list(): VisualizerStyleDefinition[] {
    return Array.from(this.definitions.values())
  }
}

export function createDefaultVisualizerStyleRegistry(): VisualizerStyleRegistry {
  const registry = new VisualizerStyleRegistry()
  for (const style of createBuiltinStyles()) {
    registry.register(style)
  }
  return registry
}

function normalizeDefinition(definition: VisualizerStyleDefinition): VisualizerStyleDefinition {
  const cleaned = definition.ramp.filter((item) => item.length > 0)
  const ramp = cleaned.length >= 2 ? cleaned : [" ", "#"]
  return { ...definition, ramp }
}

function createBuiltinStyles(): VisualizerStyleDefinition[] {
  return [
    {
      id: "blocks",
      label: "Blocks",
      description: "High-resolution block glyph ramp",
      ramp: [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"],
    },
    {
      id: "ascii",
      label: "ASCII",
      description: "Portable ASCII fallback ramp",
      ramp: [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
    },
    {
      id: "braille",
      label: "Braille",
      description: "Dense braille-inspired gradient ramp",
      ramp: [" ", "⢀", "⢠", "⢰", "⣀", "⣄", "⣤", "⣶", "⣿"],
    },
  ]
}
