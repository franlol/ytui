---
name: ytui-store-guardian
description: Validate Redux Toolkit, thunk boundaries, and dynamic reducer manager usage
metadata:
  scope: state
  priority: high
---
## What this skill does

- Checks reducer purity and thunk-only side effects.
- Validates reducer manager slice injection/removal safety.
- Ensures plugin slices are namespaced and collision-free.

## When to use

- Store changes
- Thunk/service integration changes
- Plugin slice injection changes
