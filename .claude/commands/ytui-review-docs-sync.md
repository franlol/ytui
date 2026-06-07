---
description: YTUI verify important changes updated docs and runtime definitions
---
Use the Task tool to delegate to the `ytui-docs-sync-guardian` subagent with the following prompt:

Audit docs synchronization for current changes.

Check both:
- policy/spec docs under `docs/`
- executable agentic system definitions under `.opencode/` and `.claude/` when behavior changed

Return PASS/WARN/FAIL and list missing paths.
