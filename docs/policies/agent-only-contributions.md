# Agent-Only Contributions Policy

## Policy

All repository contributions must be executed through documented slash commands and skills.

## Requirements

- Contributor must run `/ytui-plan-change` before implementation.
- Contributor must attach `AGENT_REPORT.md` in each PR.
- Contributor must run all required review commands for touched scope.
- Contributor must update corresponding specs for every important change (`docs/` and `.opencode/` when behavior/runtime definitions change).
- Contributor must run `/ytui-review-docs-sync` before merge.

## Important Change Definition

The following changes are considered important and require docs updates:

- Architecture, folder conventions, or boundaries.
- Store/slice/thunk/reducer manager behavior.
- Commands, UX flows, mode behavior, or modal behavior.
- Provider, plugin, config, or registry contracts.
- User-visible behavior and breaking changes.

## Prohibited

- Direct manual edits without an agent run record.
- Merges without command/skill results.
- Important code changes with no corresponding docs updates.

## Enforcement

CI and maintainers enforce this policy.

Exceptions are handled only via break-glass policy.
