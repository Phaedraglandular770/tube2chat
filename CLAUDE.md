# Tube2Chat

Tube2Chat

## Workflow Routing (mandatory)

| Scenario | Action |
|---|---|
| New feature / non-trivial change | `/speckit.workflow` |
| Small fix (1-2 lines, docs-only) | Direct edit, no spec |
| Bug | Apply `superpowers:systematic-debugging` |

## Architecture Constitution

Read `.specify/memory/constitution.md` before any architectural decision. It is auto-loaded at session start.


## Active Technologies
- TypeScript 5.x (strict mode) + WXT (latest), Vitest (latest), `wxt/testing` (built-in) (001-extension-scaffold)

## Recent Changes
- 001-extension-scaffold: Added TypeScript 5.x (strict mode) + WXT (latest), Vitest (latest), `wxt/testing` (built-in)
