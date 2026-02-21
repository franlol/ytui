# Agents

This folder defines how agents are used in this repository.

Executable agent definitions are stored in `.opencode/agents/*.md`.
This folder documents agent policy and execution behavior.

Read in order:
1. `execution-model.md`
2. `agent-catalog.md`
3. Command specs in `../commands/`
4. Skill specs in `../skills/`

All agent outputs must comply with `../contracts/output-format.md`.

Mandatory contributor rule: any important change must run `/ytui-review-docs-sync` and include docs updates in the same contribution.
