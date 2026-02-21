# Skill: ytui-provider-guardian

## Purpose

Enforce provider-capability architecture.

## Inputs

- provider implementation changes
- provider manager updates
- UI/feature files touching provider behavior

## Steps

1. Verify capability-based interfaces are used.
2. Verify provider manager is the integration point.
3. Verify UI remains provider-agnostic.
4. Validate capability checks before feature execution.

## Required Checks

- provider logic behind `MusicProvider` interfaces
- no provider-specific logic in UI components
- active provider selected via provider manager
- capability checks before feature use
- external provider integrations (for example `yt-dlp`) are wrapped by typed services, not called from UI/thunks directly
- playback controls (play/pause/resume/stop) are invoked through provider capability contracts, not directly from UI components
- playback seeking is invoked through provider capability contracts (no direct UI process control)
- provider playback implementations use typed playback services (for example `MpvPlaybackService`) so additional providers can reuse engine adapters

## Blocking Criteria

- provider coupling in UI layer
- bypassing provider manager in feature logic

## Outputs

- status (`PASS | WARN | FAIL`)
- capability and boundary findings with file refs
- remediation actions

## Examples

- Adding Spotify provider while keeping YouTube MVP intact.
- Refactoring search/playback thunks to provider manager.
