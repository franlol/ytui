---
name: ytui-provider-guardian
description: Enforce provider-capability architecture and provider manager usage
metadata:
  scope: providers
  priority: medium
---
## What this skill does

- Verifies provider capability boundaries.
- Ensures UI remains provider-agnostic.
- Checks provider manager orchestration correctness.
- Verifies external provider integrations (for example `yt-dlp`) are hidden behind typed service adapters.
- Verifies playback actions are routed through provider playback capabilities rather than direct UI-controlled process calls.
- Verifies provider playback uses reusable typed playback-service adapters for future provider scalability.

## When to use

- Provider implementation changes
- Capability model changes
