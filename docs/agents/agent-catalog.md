# Agent Catalog

## Core Agents

- `ytui-architecture-guardian`
  - Enforces folder/module rules, no barrels, boundaries.
- `ytui-store-guardian`
  - Enforces RTK + thunk + reducer-manager architecture.
- `ytui-plugin-author`
  - Creates plugin scaffolding and manifest-compliant plugins.
- `ytui-plugin-reviewer`
  - Validates plugin safety, manifest fields, namespace collisions.
- `ytui-provider-guardian`
  - Enforces provider-capability design and no UI coupling.
- `ytui-ui-guardian`
  - Enforces NORMAL/SEARCH/ZEN and modal UX consistency.
- `ytui-release-auditor`
  - Final quality gate before merge/release.
- `ytui-docs-sync-guardian`
  - Enforces mandatory docs updates for important changes.

See detailed behavior in `../skills/`.
