# Commands

This folder defines slash commands used by contributors and agents.

Executable command definitions are stored in `.opencode/commands/*.md`.
This folder documents command behavior and governance requirements.

All commands:
- start with `/`
- produce output following `../contracts/output-format.md`
- execute through an assigned runtime agent in `.opencode/commands/*.md`
- map to one or more skills in `../skills/` directly or indirectly via those agents

See `command-catalog.md` for index.
