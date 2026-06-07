---
description: YTUI run architecture compliance review
---
Use the Task tool to delegate to the `ytui-architecture-guardian` subagent with the following prompt:

Review the current changes for architecture compliance.

Focus on:
- folder/module conventions
- no barrel exports
- UI/store/service boundaries
- registry-driven command/style/theme behavior

Return PASS/WARN/FAIL with actionable file references.
