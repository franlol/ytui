# Theme Registry

The theme registry provides a token-based, registry-driven color system for ytui. All UI colors derive from resolved `ThemeTokens`; no hardcoded colors exist in component logic beyond fallback safety.

## Built-in Themes

| ID | Description |
|---|---|
| `gruvbox` | Warm retro default |
| `nord` | Cool nordic palette |
| `matrix` | Green phosphor terminal |
| `palenight` | Soft blue-purple Material Night palette |
| `dracula` | Dark purple Dracula palette |
| `catppuccin` | Soothing pastel dark (Mocha) |
| `one-dark` | Atom One Dark |
| `tokyo-night` | Deep blue-indigo Tokyo Night |
| `solarized-dark` | Ethan Schoonover Solarized dark |

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

## User-Defined Themes

Users can add custom themes without editing source code by placing JSON files in:

```
~/.config/ytui/themes/<name>.json
```

ytui scans this directory at startup and registers every valid `.json` file into the theme registry. Invalid files are silently skipped — they never crash the app.

### File format

```json
{
  "id": "catppuccin",
  "description": "Soothing pastel theme",
  "tokens": {
    "bg": "#1e1e2e",
    "panel": "#181825",
    "panelAlt": "#313244",
    "text": "#cdd6f4",
    "muted": "#7f849c",
    "accent": "#cba6f7",
    "border": "#45475a",
    "status": "#181825",
    "statusText": "#cdd6f4",
    "selectedBg": "#313244",
    "statusInfoText": "#cdd6f4",
    "statusOkText": "#a6e3a1",
    "statusErrText": "#f38ba8"
  }
}
```

- `id`, `description`, and all ten `ThemeBaseTokens` fields are **required**.
- Semantic status tokens (`statusInfoText`, `statusOkText`, `statusErrText`) are optional; omitting them falls back to the registry defaults.
- An `id` that matches a built-in theme is rejected — built-ins always win.
- A restart is required to pick up new or changed files.

### Constraints

| Constraint | Behaviour |
|---|---|
| Missing required field | File silently skipped |
| Invalid JSON | File silently skipped |
| `id` collides with built-in | File silently skipped |
| Directory does not exist | Silently ignored (no user themes loaded) |

### Implementation

The loader lives in `src/services/themes/theme-loader/theme-loader.ts`. It is called in `src/app/create-app/create-app.tsx` after `createDefaultThemeRegistry()`, so user themes are registered before the app renders.

## Adding a New Built-in Theme

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
