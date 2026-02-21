# Severity Model

- `critical`
  - Security/data-loss/crash risks, architecture violations, merge-blocking.
- `major`
  - Functional regressions, missing required command behavior, test gate failures.
- `minor`
  - Non-blocking quality issues, style drift, docs gaps.
- `info`
  - Observations and optimization suggestions.

Merge policy:
- Any `critical` => `FAIL`.
- Any unresolved `major` => `FAIL`.
- `minor` and `info` may pass with mitigation notes.
