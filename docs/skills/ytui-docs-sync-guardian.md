# Skill: ytui-docs-sync-guardian

## Purpose

Ensure important code changes are documented in the same contribution.

## Inputs

- changed file list
- scope summary
- docs/runtime definition change set

## Steps

1. Classify changed code by importance.
2. Map important code to required docs and `.opencode` definitions.
3. Validate updates are present and coherent.
4. Report missing mappings and required fixes.

## Required Checks

- classify changed files as important or non-important
- map changed code areas to required docs paths
- verify docs updates exist and are relevant
- verify templates/checklists reflect new process rules if workflow changed

## Blocking Criteria

- important code changes with no docs updates
- missing docs updates for changed contracts/policies/workflows

## Outputs

- status: `PASS | WARN | FAIL`
- missing docs with file refs
- explicit remediation steps

## Examples

- Architecture change in `src/state/` requires `docs/store` and `.opencode` updates.
- Command behavior change requires updates in `docs/commands/` and `.opencode/commands/`.
