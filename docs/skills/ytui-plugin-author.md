# Skill: ytui-plugin-author

## Purpose

Create plugins that comply with plugin API and manifest rules.

## Inputs

- plugin id
- plugin goal/capabilities
- target extension points (commands/themes/progress/slices)

## Steps

1. Scaffold plugin folder and manifest.
2. Validate required manifest fields (`description` mandatory).
3. Implement namespaced registrations.
4. Add tests and summarize integration points.

## Required Checks

- manifest includes required fields
- `description` present and non-empty
- command/style/theme registrations are namespaced
- optional plugin slices are namespaced

## Outputs

- plugin scaffold summary
- manifest preview
- integration points list

## Blocking Criteria

- missing required manifest fields
- unnamespaced plugin reducer/command keys
- contracts that override core behavior without explicit design approval

## Examples

- Create a plugin that adds `/ytui-foo` command and one theme.
- Add a plugin-owned reducer keyed as `plugin_<id>`.
