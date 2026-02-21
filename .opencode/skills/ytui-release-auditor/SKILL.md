---
name: ytui-release-auditor
description: Run final release gate checks and produce merge recommendation
metadata:
  scope: release
  priority: high
---
## What this skill does

- Evaluates blocking-rule compliance.
- Verifies required tests and docs synchronization.
- Produces PASS/WARN/FAIL release recommendation.

## When to use

- Before merge to main
- Before tagged release
