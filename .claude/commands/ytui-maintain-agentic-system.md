---
description: YTUI validate or audit dual-world agentic system consistency
---
Use the Task tool to delegate to the `ytui-agentic-system-guardian` subagent with the following prompt:

Validate the dual-world agentic system for:

$ARGUMENTS

If no arguments or "validate": run full audit of both .opencode/ and .claude/ worlds.
If "add agent <name>": check that <name> exists correctly in both worlds with correct schemas.
If "add command <name>": check that <name> exists correctly in both worlds.
If "add skill <name>": check that <name> exists in both worlds and content is identical.

Return PASS/WARN/FAIL with actionable file references.
