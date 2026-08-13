# Keira3

Electron + Angular desktop DB editor for AzerothCore.

Scripts in `package.json`. `nx test <project>` / `nx lint <project>` scope to one lib (e.g. `keira-features-creature`).

## Repo layout

Nx monorepo. Apps in `apps/`, libs in `libs/`. Library names: `keira-<scope>-<name>`. Path aliases `@keira/<scope>/<name>` in `tsconfig.base.json` — always use these between libs, never relative paths.

Angular app is `apps/keira`. Routes table: `apps/keira/src/app/routes.ts`. Hash routing (`withHashLocation()`) — internal links must use `routerLink`. Routed components must be re-exported from the feature lib's `src/index.ts`.

Module boundaries enforced by `@nx/enforce-module-boundaries`:

```
app-keira → main-window → features → shared
```

A feature MUST NOT import another feature; move shared code to `libs/shared/`.

`libs/features/<name>/` — one lib per editor domain. `libs/main/` — window shell. `libs/shared/` — models, base classes, DB layer, reusable UI. Per-lib map: [architecture](.agents/docs/architecture.md) — read when deciding where code goes.

## Docs

- [Conventions](.agents/docs/conventions.md) — read before writing any code.
- [Testing](.agents/docs/testing.md) — read before writing or running any test; 100% coverage is enforced, so that's every code change.
- [Editor pattern](.agents/docs/editor-pattern.md) — read before adding or changing an editor, handler, select, or selector, or touching the DB/SQL layer; includes the new-editor recipe and the `MysqlQueryService` API.
- [Agent setup](.agents/docs/agent-setup.md) — this repo's agent layout and hookup recipes; read when wiring an agent or moving skills/docs.

Agent planning docs go in `.agents/plans/<task-slug>/` (gitignored).
