---
name: ytui-plugin-reviewer
description: Review plugins for manifest correctness, safety, and compatibility
metadata:
  scope: plugins
  priority: high
---
## What this skill does

- Validates plugin manifest required fields and format.
- Audits plugin state/command namespace conflicts.
- Checks runtime failure isolation expectations.

## When to use

- Plugin PR review
- Pre-release plugin validation
