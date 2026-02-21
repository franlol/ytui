# Execution Model

## Goal

All repository changes are executed through defined slash commands and skills.

## Rules

- Manual contributions are not allowed unless break-glass policy is triggered.
- Every change request starts with `/ytui-plan-change`.
- Every implementation ends with `/ytui-review-architecture`.
- Every important change must run `/ytui-review-docs-sync`.
- Plugin changes also require `/ytui-review-plugin`.
- Release branch merges require `/ytui-release-audit`.

## Required Artifacts

- `AGENT_REPORT.md` generated from `../templates/agent-report.template.md`.
- Command results following `../contracts/output-format.md`.
- PR checklist using `../templates/pr-checklist.template.md`.
- Docs mapping section (`code paths -> docs paths`) in `AGENT_REPORT.md`.

## Failure Handling

- If any command returns `FAIL`, merge is blocked.
- `WARN` is allowed only with explicit mitigation notes in `AGENT_REPORT.md`.
