# Skill: ytui-release-auditor

## Purpose

Final release readiness validation.

## Inputs

- release diff summary
- test results
- architecture/docs/plugin audit outputs

## Steps

1. Aggregate required audit outputs.
2. Validate blocking rules and unresolved majors.
3. Validate docs-sync and contract compliance.
4. Publish release recommendation.

## Required Checks

- required tests pass
- docs updated for changed behavior
- config compatibility maintained
- blocking rules clear

## Outputs

- release recommendation: `PASS | WARN | FAIL`
- unresolved risk list

## Blocking Criteria

- unresolved `critical` findings
- unresolved blocking-rule violations
- missing required release gates

## Examples

- Final pre-merge audit for release branch.
- Tag readiness check before publishing.
