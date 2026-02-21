# /ytui-review-plugin

## Purpose

Validate plugin compliance and safety.

## Inputs

- plugin id/path

## Skills

- `ytui-plugin-reviewer`
- `ytui-architecture-guardian`

## Blocking Checks

- manifest required fields include `description`
- namespaced reducers
- no core slice override
- command collisions handled

## Required Output

- findings with severities
- remediation tasks
- `PASS/WARN/FAIL`
