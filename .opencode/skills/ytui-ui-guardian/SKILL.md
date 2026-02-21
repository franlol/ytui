---
name: ytui-ui-guardian
description: Validate core UX invariants across NORMAL, SEARCH, ZEN, and help modal
metadata:
  scope: ui
  priority: medium
---
## What this skill does

- Verifies required views and transitions.
- Ensures command mode and help modal behavior remain coherent.
- Flags user-visible regressions.
- Verifies list panels remain viewport-safe and do not overflow container bounds.
- Verifies fixed-height panel constraints for SEARCH, NOW PLAYING, and CAVA with results/queue filling remaining space.
- Verifies fixed panels take precedence in very small viewports and list panels may collapse if remaining space is insufficient.
- Verifies SEARCH panel height budgeting includes its chrome so CAVA does not touch the statusline.

## When to use

- UI layout or interaction changes
- Command UX updates
