---
name: ytui-docs-sync-guardian
description: Ensure important code changes include matching docs and runtime definition updates
metadata:
  scope: docs-sync
  priority: high
---
## What this skill does

- Detects important code changes.
- Verifies corresponding updates in `docs/` and `.opencode/` definitions.
- Reports missing mappings with PASS/WARN/FAIL.

## When to use

- Any important architectural or behavior change
- Before merge/release audits
