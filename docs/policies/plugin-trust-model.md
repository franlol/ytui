# Plugin Trust Model

## Trust Level

Plugins are treated as local trusted code by default.

## Safety Requirements

- Plugin errors must not crash app.
- Plugin slices must be namespaced.
- Plugin command collisions must be rejected.
- Manifest validation is mandatory.

## Manifest Requirements

- `id`
- `name`
- `version`
- `description` (mandatory)
- `apiVersion`
- `entry`

## Future Hardening (non-MVP)

- Signed plugins
- Permission prompts
- Sandbox runtime
