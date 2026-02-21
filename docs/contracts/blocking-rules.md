# Blocking Rules

A change is blocked if any of the following is true:

- `index.ts` barrel exports are introduced.
- Significant module is not in its own folder with `*.types.ts` and `__tests__/`.
- UI calls external services/processes directly.
- Plugin manifest lacks required fields (`description` included).
- Plugin reducer collides with core slice keys.
- Command system bypasses registry model.
- Config behavior violates `~/.config/ytui/ytui.conf` contract.
- Required tests for touched areas are missing or failing.
- Important code changes are made without matching updates under `docs/` and/or `.opencode/`.
- `/ytui-review-docs-sync` is not executed for important changes.

Override path: see `../policies/break-glass-policy.md`.
