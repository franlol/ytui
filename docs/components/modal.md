# Modal

Shared absolute-overlay container for all dialog-style UI in ytui.

**File:** `src/components/modal/modal.tsx`  
**Helpers:** `src/components/modal/modal.helpers.ts`  
**Types:** `src/components/modal/modal.types.ts`

## Rule

All future absolute-overlay components must use `Modal` as their container. Do not copy-paste the chrome props (`position="absolute"`, `borderStyle="double"`, `borderColor={theme.accent}`, etc.) into new components.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | OpenTUI element id |
| `title` | `string` | required | Centered top border title |
| `bottomHint` | `string` | — | Centered bottom border hint (keybinds etc.) |
| `theme` | `ThemeTokens` | required | Token set for colors |
| `screenWidth` | `number` | required | Terminal width in columns |
| `screenHeight` | `number` | required | Terminal height in rows |
| `width` | `number` | — | Explicit width in columns |
| `widthFraction` | `number` | — | Width as fraction of screenWidth (e.g. `0.68`) |
| `minWidth` | `number` | — | Floor for fraction-computed width |
| `height` | `number` | — | Explicit height in rows |
| `heightFraction` | `number` | — | Height as fraction of screenHeight (e.g. `0.6`) |
| `positioning` | `ModalPositioning` | `{ strategy: "centered" }` | Positioning strategy |
| `children` | `ReactNode` | — | Modal content |

`width` or `widthFraction` must be provided. If both are given, `widthFraction` takes precedence.

## Positioning Strategies

```typescript
{ strategy: "centered" }
// top = floor((screenHeight - finalHeight) / 2)
// left = floor((screenWidth - finalWidth) / 2)

{ strategy: "top-anchored"; top: number }
// top = given value
// left = floor((screenWidth - finalWidth) / 2)  (always horizontally centered)
```

## Chrome (always applied)

- `position="absolute"`
- `borderStyle="double"`
- `borderColor={theme.accent}`
- `backgroundColor={theme.panelAlt}`
- `titleAlignment="center"`
- `bottomTitleAlignment="center"`
- `padding={1}`
- `flexDirection="column"`, `gap={0}`

## Usage Examples

```tsx
// Centered dialog (e.g. theme picker)
<Modal
  id="my-picker"
  title="PICK"
  bottomHint="j/k · Enter · Esc"
  theme={theme}
  screenWidth={screenWidth}
  screenHeight={screenHeight}
  width={60}
  heightFraction={0.6}
  positioning={{ strategy: "centered" }}
>
  <select ... />
</Modal>

// Centered dialog (e.g. help modal)
<Modal
  id="help-modal"
  title="HELP"
  bottomHint="Esc · q · Enter"
  theme={theme}
  screenWidth={screenWidth}
  screenHeight={screenHeight}
  widthFraction={0.68}
  minWidth={48}
  heightFraction={0.6}
  positioning={{ strategy: "centered" }}
>
  <text content="..." fg={theme.text} />
</Modal>
```

## Current Consumers

| Component | Strategy | Width | Height |
|---|---|---|---|
| `HelpModal` | `centered` | 68% of screen, min 48 | 60% of screen |
| `ThemePicker` | `centered` | 60 cols | 60% of screen |
