---
description: YTUI author a plugin with manifest and safety constraints
---
Use the Task tool to delegate to the `ytui-plugin-author` subagent with the following prompt:

Create or update a plugin for:

$ARGUMENTS

Enforce:
- required manifest fields including `description`
- namespaced reducer and command keys
- no core contract violations
