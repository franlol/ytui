import type { CommandDefinition } from "./command.registry.types"

export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>()
  private aliases = new Map<string, string>()

  register(definition: CommandDefinition) {
    this.commands.set(definition.name, definition)

    for (const alias of definition.aliases ?? []) {
      this.aliases.set(alias, definition.name)
    }
  }

  resolve(name: string): CommandDefinition | undefined {
    const canonical = this.aliases.get(name) ?? name
    return this.commands.get(canonical)
  }

  list(): CommandDefinition[] {
    return Array.from(this.commands.values())
  }
}
