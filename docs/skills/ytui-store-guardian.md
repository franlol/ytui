# Skill: ytui-store-guardian

## Purpose

Enforce Redux Toolkit + thunk + reducer manager architecture.

## Inputs

- changed store/feature files
- thunk and service integration details
- plugin slice injection requirements

## Steps

1. Inspect reducer logic for purity.
2. Validate side effects remain in thunks/services.
3. Validate reducer manager usage and dynamic injection/removal.
4. Verify plugin slice namespacing and collision safety.

## Required Checks

- reducers are pure
- side effects in thunks/services only
- typed service interfaces used by thunks
- dynamic reducer manager supports plugin slices
- plugin slice keys are namespaced
- `saveConfigThunk`: persists current settings state to disk via `extra.configService.save(state.settings)`; must not be dispatched from reducers or UI components directly — only from `app-root` key handling on settings exit
- `switchActiveProviderThunk`: the only valid way to change the active provider at runtime; validates `id` exists in `state.provider.available`, calls `extra.providerManager.setActive(id)`, then dispatches `providerActions.setActiveProvider(id)`; dispatching `providerActions.setActiveProvider` directly without the thunk leaves `providerManager` out of sync and is a bug

## Blocking Criteria

- reducer side effects
- direct service calls from UI
- plugin slice collision with core slices

## Outputs

- status (`PASS | WARN | FAIL`)
- state architecture findings with file refs
- required fixes and test recommendations

## Examples

- Use when adding new slices/thunks.
- Use when enabling plugin reducer injection.
