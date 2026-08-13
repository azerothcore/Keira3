# Agent setup

One agent-neutral config shared by every teammate's coding agent:

- [`AGENTS.md`](../../AGENTS.md) (repo root) — canonical instructions, loaded every session; links docs in `.agents/docs/` to be read on demand.
- `.agents/skills/` — skill dirs (committed; synced via `skills-lock.json`).
- `.agents/plans/` — planning documents (gitignored).
- `CLAUDE.md` — just `@AGENTS.md`: Claude Code reads CLAUDE.md, not AGENTS.md. `.claude/skills/` holds relative symlinks into `.agents/skills/`.

## Hooking up an agent

- **Claude Code** — works as-is via `CLAUDE.md` and `.claude/skills/`.
- **Agents that read `AGENTS.md` natively** (Codex, …) — work as-is.
- **Anything else** — point its entry file at `AGENTS.md` (include syntax if supported, else duplicate the content), or re-run `/agentify-project` to research and wire it. Commit the wiring for teammates.

## Windows

Checking out the `.claude/skills/` symlinks needs git `core.symlinks=true` and Developer Mode (or admin rights).
