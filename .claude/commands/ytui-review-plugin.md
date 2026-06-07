---
description: YTUI review plugin compliance and runtime safety
---
Use the Task tool to delegate to the `ytui-plugin-reviewer` subagent with the following prompt:

Review plugin changes:

$ARGUMENTS

Validate manifest, namespace safety, command collisions, and error isolation.
Return PASS/WARN/FAIL and blocking items first.
