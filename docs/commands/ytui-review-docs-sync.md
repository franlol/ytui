# /ytui-review-docs-sync

## Purpose

Verify that important code changes include corresponding docs and runtime definition updates.

## Inputs

- changed file list
- impacted scope summary

## Skills

- `ytui-docs-sync-guardian`

## Required Checks

- important code areas changed => relevant updates under `docs/` and/or `.opencode/` changed
- `AGENT_REPORT.md` includes docs mapping section
- no missing policy/contract/workflow updates when rules changed

## Required Output

- missing docs list (if any)
- suggested docs files to update
- `PASS/WARN/FAIL`
