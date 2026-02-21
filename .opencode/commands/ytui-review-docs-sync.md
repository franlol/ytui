---
description: YTUI verify important changes updated docs and runtime definitions
agent: ytui-docs-sync-guardian
subtask: true
---
Audit docs synchronization for current changes.

Check both:
- policy/spec docs under `docs/`
- executable runtime definitions under `.opencode/` when behavior changed

Return PASS/WARN/FAIL and list missing paths.
