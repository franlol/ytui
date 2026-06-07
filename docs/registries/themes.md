# Theme Registry

The theme registry provides a token-based, registry-driven color system for ytui. All UI colors derive from resolved `ThemeTokens`; no hardcoded colors exist in component logic beyond fallback safety.

## Built-in Themes

| ID | Description |
|---|---|
| `gruvbox` | Warm retro default |
| `nord` | Cool nordic palette |
| `matrix` | Green phosphor terminal |
| `palenight` | Soft blue-purple Material Night palette |

## Runtime Commands

```
:theme list          — list all registered theme IDs
:theme <id>          — switch active theme (e.g. :theme palenight)
:theme pick          — open the interactive theme picker (j/k to preview live, Enter to confirm, Esc to cancel)
```

## Config Persistence

The active theme is stored in `~/.config/ytui/ytui.conf`:

```
THEME="gruvbox"
```

On startup the config value is loaded into `state.settings.themeId`. On shutdown the current value is saved back.

## Token Contract

Every theme must supply all `ThemeBaseTokens`. Semantic status tokens (`statusInfoText`, `statusOkText`, `statusErrText`) are optional and resolved by `resolveThemeTokens()` with sensible fallbacks.

| Token | Role |
|---|---|
| `bg` | App background |
| `panel` | Panel / sidebar background |
| `panelAlt` | Raised surface (topbar, now-playing) |
| `text` | Primary foreground |
| `muted` | Secondary / dimmed foreground |
| `accent` | Highlight / active indicator |
| `border` | Panel borders |
| `status` | Statusline background |
| `statusText` | Statusline foreground |
| `selectedBg` | Selected row / current item background |
| `statusInfoText` | Info-level status messages |
| `statusOkText` | Ok/success status messages |
| `statusErrText` | Error status messages |

## Adding a New Theme

1. Open `src/registries/themes/theme.registry.ts`.
2. Inside `createDefaultThemeRegistry()`, call `registry.register()` with a `ThemeDefinition`:

```typescript
registry.register({
  id: "mytheme",
  description: "One-line human description",
  tokens: {
    bg: "#...",
    // ... all ThemeBaseTokens
  },
})
```

3. Update this file to list the new theme in the Built-in Themes table.
4. Verify with `:theme list` and `:theme mytheme` in a running instance.

No other files require changes for a built-in theme addition.
