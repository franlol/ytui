# Skill: ytui-architecture-guardian

## Purpose

Enforce repository architecture constraints.

## Inputs

- changed file list
- architecture-relevant requirements
- AGENTS.md constraints

## Steps

1. Identify changed modules and classify by layer.
2. Verify folder conventions and no-barrel policy.
3. Verify boundaries across UI, services, state, and registries.
4. Produce findings with file references.

## Required Checks

- no barrel exports (`index.ts` re-exports)
- significant modules use folder + `*.types.ts` + `__tests__/`
- boundaries: UI vs services vs state
- commands use registry model

## Blocking Criteria

Any violation in `docs/contracts/blocking-rules.md`.

## Outputs

- status (`PASS | WARN | FAIL`)
- violations with severities and file refs
- remediation actions

## Examples

- Use after structural refactors.
- Use before merging feature branches touching `src/components/`, `src/services/`, `src/state/`.
