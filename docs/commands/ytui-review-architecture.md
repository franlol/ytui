# /ytui-review-architecture

## Purpose

Validate architecture compliance after implementation.

## Skills

- `ytui-architecture-guardian`
- `ytui-store-guardian`

## Blocking Checks

- no barrel exports
- folder/type/test structure for significant modules
- service/UI/store boundaries respected
- registry patterns preserved

## Required Output

- violations list with file refs
- remediation actions
- `PASS/WARN/FAIL`
