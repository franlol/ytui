# Skill: ytui-plugin-reviewer

## Purpose

Audit plugin safety and compatibility.

## Inputs

- plugin files and manifest
- plugin registration points
- changed core interfaces (if any)

## Steps

1. Validate manifest fields and shape.
2. Validate reducer and command namespace safety.
3. Validate plugin failure isolation behavior.
4. Report blocking/non-blocking findings.

## Required Checks

- manifest required fields and `apiVersion`
- reducer namespace collisions
- command conflicts
- failure isolation (plugin error must not crash app)

## Blocking Criteria

- missing required manifest fields
- reducer or command collision without handling
- crash-inducing behavior

## Outputs

- status (`PASS | WARN | FAIL`)
- findings with severities and file refs
- remediation list

## Examples

- Review plugin PRs before merge.
- Run as part of release audit for plugin-heavy changes.
