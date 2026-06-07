import { describe, expect, it, mock } from "bun:test"
import { CommandRegistry } from "../../../../registries/commands/command.registry"
import { createDefaultThemeRegistry } from "../../../../registries/themes/theme.registry"
import { setupDefaultCommands } from "../setup-default-commands"

function makeContext(overrides: Record<string, unknown> = {}) {
  const dispatched: unknown[] = []
  return {
    context: {
      dispatch: (action: unknown) => { dispatched.push(action) },
      getState: () => ({ settings: { themeId: "gruvbox" } }),
      themeRegistry: createDefaultThemeRegistry(),
      progressStyleRegistry: { list: () => [], get: () => undefined },
      visualizerStyleRegistry: { list: () => [], get: () => undefined },
      requestQuit: mock(() => {}),
      ...overrides,
    },
    dispatched,
  }
}

function makeRegistry() {
  const registry = new CommandRegistry()
  setupDefaultCommands(registry)
  return registry
}

describe(":theme command", () => {
  it("list dispatches a status with all theme ids", () => {
    const { context, dispatched } = makeContext()
    makeRegistry().resolve("theme")!.execute(["list"], context as never)
    const action = dispatched[0] as { payload: { message: string } }
    expect(action.payload.message).toContain("gruvbox")
    expect(action.payload.message).toContain("palenight")
  })

  it("no args behaves like list", () => {
    const { context, dispatched } = makeContext()
    makeRegistry().resolve("theme")!.execute([], context as never)
    const action = dispatched[0] as { payload: { message: string } }
    expect(action.payload.message).toContain("INFO:")
  })

  it("<valid-id> dispatches setTheme", () => {
    const { context, dispatched } = makeContext()
    makeRegistry().resolve("theme")!.execute(["nord"], context as never)
    const setTheme = dispatched.find((a) => (a as { type: string }).type === "settings/setTheme") as { payload: string }
    expect(setTheme?.payload).toBe("nord")
  })

  it("<invalid-id> dispatches an ERR status", () => {
    const { context, dispatched } = makeContext()
    makeRegistry().resolve("theme")!.execute(["unknown-theme"], context as never)
    const action = dispatched[0] as { payload: { message: string } }
    expect(action.payload.message).toContain("ERR:")
  })

  it("pick dispatches openThemePicker with current index and id", () => {
    const { context, dispatched } = makeContext()
    makeRegistry().resolve("theme")!.execute(["pick"], context as never)
    const action = dispatched[0] as { type: string; payload: { previousId: string; selectedIndex: number } }
    expect(action.type).toBe("ui/openThemePicker")
    expect(action.payload.previousId).toBe("gruvbox")
    expect(typeof action.payload.selectedIndex).toBe("number")
  })
})
