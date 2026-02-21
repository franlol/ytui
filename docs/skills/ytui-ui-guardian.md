# Skill: ytui-ui-guardian

## Purpose

Protect MVP UX consistency.

## Inputs

- UI/layout changes
- command behavior affecting UX
- mode transition updates

## Steps

1. Validate NORMAL/SEARCH/ZEN behavior.
2. Validate help modal and command-line interaction.
3. Validate sidebar control contract.
4. Report user-visible regressions.

## Required Checks

- views: NORMAL, SEARCH, ZEN
- help remains modal via `:?`
- sidebar controlled by command
- statusline behavior remains Vim-like
- results/queue lists are viewport-safe (no overflow beyond panel height)
- SEARCH, NOW PLAYING, and CAVA panels keep fixed heights while results/queue consume remaining space
- on very small terminals, fixed panels remain visible first and results/queue may collapse when remaining height is below renderable minimum
- SEARCH height budget accounts for border + padding so CAVA keeps a visible gap above statusline

## Blocking Criteria

- broken mode transitions
- loss of required commands/help entry

## Outputs

- status (`PASS | WARN | FAIL`)
- UX findings with reproduction hints and file refs
- remediation actions

## Examples

- Review mode-cycle changes.
- Review statusline/command feedback updates.
