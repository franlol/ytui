# Output Format Contract

All slash command and skill executions must produce:

## Header

- `command`: slash command name
- `timestamp`: UTC ISO8601
- `status`: `PASS | WARN | FAIL`

## Findings

List items with:
- `severity`: `critical | major | minor | info`
- `summary`
- `fileRefs`: list of repo paths
- `actionRequired`: boolean

## Actions

- `completed`: what was done
- `blocked`: what could not be completed
- `nextSteps`: explicit remediation

## Machine Readable Appendix

Include a compact JSON block:

```json
{
  "status": "PASS",
  "criticalCount": 0,
  "majorCount": 0,
  "minorCount": 1
}
```
