# SettingsPanel Component

Entry: `src/components/settings-panel/settings-panel.tsx`  
Helpers: `src/components/settings-panel/settings-panel.helpers.ts`  
Types: `src/components/settings-panel/settings-panel.types.ts`

## Props (`SettingsPanelProps`)

| Prop | Type | Description |
|---|---|---|
| `categoryIndex` | `number` | Index into `SETTINGS_CATEGORIES` — determines the active tab. |
| `itemIndex` | `number` | Currently selected item within the active category. |
| `items` | `SettingsRowDisplay[]` | Pre-built display items for the active category. |
| `heightRows` | `number` | Total rows allocated to the panel by the parent layout. |
| `widthCols` | `number` | Column width for the panel (used by parent for sizing). |
| `theme` | `ThemeTokens` | Active theme token set. |

## Types

### `SettingsRowDisplay`

```ts
type SettingsRowDisplay = {
  name: string         // Row label, typically "Key: value"
  description: string  // Secondary hint line shown below the name
  disabled?: boolean   // Grays out the row and prevents selection
}
```

### `SettingDescriptor`

Internal type used by `buildCategoryItems`. Combines a `SettingsRowDisplay` with an optional `onChange` handler:

```ts
type SettingDescriptor = {
  display: SettingsRowDisplay
  onChange?: (dispatch: AppDispatch, direction: 1 | -1) => void
  disabled?: boolean
}
```

`onChange` receives a `dispatch` function and a `direction` (`+1` or `-1`) corresponding to right/left arrow key presses.

## `SETTINGS_CATEGORIES`

Ordered array of `{ id: SettingCategory, label: string }`. The order determines tab rendering and the mapping from `settingsCategoryIndex` to a category.

```
["appearance", "visualizer", "behavior", "providers", "plugins"]
```

## `buildCategoryItems(category, state, registries, dispatch)`

Builds `SettingDescriptor[]` for a given category. Each descriptor holds both the display data and a live `onChange` closure that dispatches to the provided `dispatch`. Used by `app-root` to handle key events in settings mode.

## `buildCategoryDisplayItems(category, state, registries)`

Display-only variant of `buildCategoryItems`. Passes a no-op dispatch — `onChange` closures are never called. Returns `SettingsRowDisplay[]` for rendering purposes only. Used by `SettingsLayout` to pass items to `SettingsPanel`.

**Do not use this function if you need `onChange` to work.** Use `buildCategoryItems` with a real `AppDispatch` instead.

## Height accounting

The panel internally reserves:
- `TAB_ROWS = 3` — tab strip (border + label + border)
- `LEGEND_ROWS = 3` — key legend with top/bottom padding
- `CONTENT_BORDER_ROWS = 2` — content pane border

`innerHeight = heightRows - TAB_ROWS - LEGEND_ROWS - CONTENT_BORDER_ROWS`

The parent layout (`SettingsLayout`) must account for this when computing `panelHeight`.
