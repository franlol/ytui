# Break-Glass Policy

## Purpose

Allow emergency changes when agent workflow cannot complete in time.

## Allowed Scenarios

- Security incident response
- Critical production outage
- Data corruption prevention

## Requirements

- Explicit `BREAK_GLASS` label in PR.
- Short incident rationale.
- Post-incident agent reconciliation PR within 48 hours.

## Limits

- No permanent bypass of architecture rules.
- No skipping mandatory docs updates.
