# Provider Feature

## Slice: `provider`

State shape:

```ts
{
  activeProviderId: string   // ID of the currently active provider
  available: ProviderInfo[]  // Providers registered at startup
}
```

`ProviderInfo` is defined in `src/features/provider/provider.types.ts`.

## Actions

| Action | Description |
|---|---|
| `providerActions.setActiveProvider(id)` | Set the active provider ID in state. **Do not dispatch directly** — use `switchActiveProviderThunk`. |
| `providerActions.registerProvider(info)` | Register a provider at startup via the provider manager. |

## Thunks

### `switchActiveProviderThunk(id: string)`

The **only** way to switch the active provider at runtime.

- Validates that `id` exists in `state.provider.available` — silently returns if not.
- Calls `extra.providerManager.setActive(id)` to apply the change in the service layer.
- Dispatches `providerActions.setActiveProvider(id)` to sync state.

**Constraint:** Never dispatch `providerActions.setActiveProvider` directly to switch providers. The thunk is required because the service layer (`providerManager`) must be notified before state is updated. Dispatching the action alone leaves the service out of sync.

```ts
// Correct
dispatch(switchActiveProviderThunk("spotify"))

// Wrong — skips providerManager.setActive()
dispatch(providerActions.setActiveProvider("spotify"))
```

## Provider Manager

The `providerManager` service is injected via Redux Toolkit `extra`. It holds the live provider instances and routes search/player calls to the active one. State in the `provider` slice is a mirror of the manager's runtime state, not the source of truth.

## Adding a New Provider

1. Implement the `MusicProvider` interface (`src/types/provider.types.ts`).
2. Register it with the provider manager at app startup before the store is created.
3. The manager calls `providerActions.registerProvider` to populate `state.provider.available`.
4. Users can then switch to the new provider via `:provider use <id>` or the Settings screen.
