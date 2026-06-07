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
- Verifies playback seek actions are routed through provider playback capabilities rather than direct UI-controlled process calls.
- Verifies playback progress telemetry is routed through provider playback capabilities rather than direct UI-controlled process reads.
- Verifies provider playback uses reusable typed playback-service adapters for future provider scalability.
- Verifies visualizer source routing defaults to provider-scoped isolation and only uses global/system routing when explicitly configured.
- Verifies youtube provider owns a `StreamUrlCache` instance and all stream URL resolution flows through it (TTL 4h, max 3 concurrent fetches, evict-on-failure).
- Verifies `prefetch` is called with result track IDs after every search batch.

## When to use

- Provider implementation changes
- Capability model changes
