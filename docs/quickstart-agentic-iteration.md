# Quickstart: Agentic Iteration

Use this loop for every contribution.

## Standard Loop

1. Plan
   - Run `/ytui-plan-change <goal>`
2. Implement
   - Run `/ytui-implement-feature <goal>`
3. Review architecture
   - Run `/ytui-review-architecture`
4. Review docs sync
   - Run `/ytui-review-docs-sync`
5. Release/merge gate (when ready)
   - Run `/ytui-release-audit`

If plugin work is involved, also run:
- `/ytui-author-plugin <plugin-id or goal>`
- `/ytui-review-plugin <plugin-id or path>`

## Minimal Example

```text
/ytui-plan-change "wire real yt-dlp search in provider"
/ytui-implement-feature "wire real yt-dlp search in provider"
/ytui-review-architecture
/ytui-review-docs-sync
```

## Required Artifacts Before Merge

- `AGENT_REPORT.md` completed
- PR checklist completed (`docs/templates/pr-checklist.template.md`)
- Any important code change has matching updates in `docs/` and/or `.opencode/`

## Which Commands Should I Run?

- Feature change:
  - `/ytui-plan-change` -> `/ytui-implement-feature` -> `/ytui-review-architecture` -> `/ytui-review-docs-sync`
- Plugin change:
  - `/ytui-plan-change` -> `/ytui-author-plugin` -> `/ytui-review-plugin` -> `/ytui-review-architecture` -> `/ytui-review-docs-sync`
- Release:
  - `/ytui-release-audit` -> `/ytui-review-docs-sync`
