# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Keira3 is a cross-platform Electron + Angular desktop application that serves as a database editor for the [AzerothCore](https://www.azerothcore.org) WoW MMORPG framework. It generates SQL queries from UI interactions, allowing users to edit game database content without writing SQL manually.

## Commands

### Development
```bash
npm start                          # Run dev with hot reload (Angular + Electron)
npm run ng:serve:web               # Serve Angular only (web mode, opens browser)
```

### Build
```bash
npm run build:prod                 # Production build (output in /dist)
npm run electron:local             # Build production and run Electron locally
```

### Testing
```bash
npm run test                       # Run unit tests for affected projects (Karma/Jasmine)
nx test <project-name>             # Run tests for a specific library
nx test keira-features-creature    # Example: test creature feature
nx test keira-shared-utils         # Example: test shared utils
npm run e2e                        # Run Playwright E2E tests (requires build:prod first)
```

### Linting & Formatting
```bash
npm run lint                       # Lint affected projects
nx lint <project-name>             # Lint a specific project
npm run format                     # Format all files with Prettier
```

## Architecture

### Nx Monorepo Structure

The codebase is an Nx monorepo with apps in `apps/` and libraries in `libs/`. Library names follow the pattern `keira-<scope>-<name>` (e.g., `keira-features-creature`, `keira-shared-utils`). All library path aliases are declared in `tsconfig.base.json` under `@keira/*`.

### Dependency Hierarchy (enforced by ESLint module boundaries)

```
app (scope:app-keira)
  -> main-window (scope:main-window)
    -> features (scope:features)
      -> shared (scope:shared)
```

Features can only import from shared. Main-window can import from features and shared. This is enforced via `@nx/enforce-module-boundaries`.

### Library Scopes

- **`libs/features/`** - Feature modules: creature, quest, item, gameobject, spell, smart-scripts, conditions, gossip, trainer, texts, other-loots, dashboard, sql-editor, game-tele, unused-guid-search
- **`libs/shared/`** - Shared code: base-abstract-classes, base-editor-components, acore-world-model (DB entity models), db-layer (MySQL/SQLite), selectors (reusable modal selectors), sai-editor, loot-editor, common-services, constants, config, test-utils, utils
- **`libs/main/`** - Shell components: connection-window, main-window

### Editor Pattern (Core Architecture)

Every database editor follows an inheritance-based pattern with three variants:

**Single-Row Editor** (e.g., creature_template): `SingleRowEditorService<T>` / `SingleRowEditorComponent<T>`
- Edits one row, generates UPDATE queries from field diffs

**Multi-Row Editor** (e.g., creature_loot_template): `MultiRowEditorService<T>` / `MultiRowEditorComponent<T>`
- Edits arrays of rows linked by FK, generates DELETE+INSERT queries

**Complex Key Editor** (e.g., smart_scripts): `SingleRowComplexKeyEditorService<T>` / `ComplexKeyHandlerService<T>`
- Handles composite primary keys

Each feature has:
- A **HandlerService** managing selected entity state and route guards
- One or more **EditorServices** extending the base classes (only need to set `_entityClass`, `_entityTable`, `_entityIdField`)
- **Components** extending base editor components
- A **SelectService/SelectComponent** for entity search

SQL queries are built using the **Squel** library in `MysqlQueryService`.

### Testing Patterns

- **Unit tests** (`.spec.ts`): Use Jasmine + Karma with `ts-mockito` for mocking
- **Integration tests** (`.integration.spec.ts`): Use a **PageObject pattern** from `@keira/shared/test-utils`
- **100% code coverage** is enforced (statements, lines, branches, functions)

## Code Conventions

- **Standalone components** (no NgModules), **OnPush** change detection required
- **Zoneless** change detection (`provideZonelessChangeDetection()`)
- **Angular Signals** for state (e.g., unsaved status in HandlerServices)
- Component selector prefix: `keira-` (kebab-case for elements, camelCase for directives)
- Use `inject()` function for DI (not constructor injection)
- `no-console` rule: only `console.warn`, `console.info`, `console.error` allowed
- Self-closing tags required in component templates
- Prettier: 140 char width, single quotes, trailing commas
- Pre-commit hook runs `pretty-quick --staged`
