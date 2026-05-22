# CLAUDE.md

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

`libs/features/<name>/` — one lib per editor domain: `creature`, `quest`, `item`, `gameobject`, `spell`, `smart-scripts`, `conditions`, `gossip`, `trainer`, `texts`, `other-loots`, `dashboard`, `sql-editor`, `game-tele`, `unused-guid-search`.

`libs/main/{connection-window,main-window}/` — shell. Sidebar entries: `libs/main/main-window/src/sidebar/`.

`libs/shared/`:
- `acore-world-model` — DB row classes + `*_TABLE`, `*_ID` constants (and optional `*_NAME`, `*_SEARCH_FIELDS`) in `src/entities/`; dropdown `Option[]` arrays in `src/options/`; bitmask `Flag[]` arrays in `src/flags/`. New tables go here first; re-export from `src/index.ts`.
- `base-abstract-classes` — editor / handler / select base classes (see Editor pattern).
- `base-editor-components` — `TopBarComponent`, `EditorButtonsComponent`, `QueryOutputComponent`, `CreateComponent`, `IconComponent`, `ModalConfirmComponent`, `HighlightjsWrapperComponent`.
- `db-layer` — `MysqlService`, `SqliteService` (Electron-only), `MysqlQueryService` (Squel SQL builder), `SqliteQueryService`.
- `selectors` — `SingleValueSelectorBtnComponent`, `FlagsSelectorBtnComponent`; concrete pickers in `src/selectors/`.
- `sai-editor` — reusable Smart-AI editor, embedded in `smart-scripts`, `creature`, `gameobject` (creature additionally uses `SaiCreatureHandlerService`).
- `loot-editor` — `*_loot_template` building blocks.
- `test-utils` — PageObject base classes for integration tests.
- `utils` — `SubscriptionHandler` (base that auto-unsubscribes in `ngOnDestroy`), `compareObjFn`, `getPartial`, `ModelForm` type.
- `common-services` — `ElectronService` (wraps `window.require`, exposes `isElectron()`), `ConfigService`, `LocationService`.
- `config` — `KEIRA_APP_CONFIG_TOKEN`, `squelConfig`.

## Editor pattern

Base classes in `@keira/shared/base-abstract-classes`:

```
SubscriptionHandler (@keira/shared/utils)
├── EditorService<T>
│   ├── SingleRowEditorService<T> → SingleRowComplexKeyEditorService<T>
│   ├── MultiRowEditorService<T>  → MultiRowComplexKeyEditorService<T>
│   └── MultiRowExternalEditorService<T>
├── HandlerService<T> → ComplexKeyHandlerService<T>
└── SearchService<T>  → SelectService<T>

EditorComponent<T>
├── SingleRowEditorComponent<T>
└── MultiRowEditorComponent<T> → LootTemplateComponent<T> → LootTemplateIdComponent<T>

SelectComponent<T>, SelectComplexKeyComponent<T>
```

Flavour:
- One row per main entity → `SingleRowEditorService` (+ component). Emits diff `UPDATE … SET … WHERE entityIdField = ?`.
- Many rows per main entity → `MultiRowEditorService` (+ component). Emits atomic `DELETE … WHERE entityIdField = ?` + `INSERT INTO … VALUES …` to replace the row set.
- Composite PK (e.g. `smart_scripts`) → `*ComplexKey*` variants (key serialised to JSON).
- `*_loot_template` table → extend `LootTemplateComponent<T>` / `LootTemplateIdComponent<T>`.

`EditorService` rebuilds `_diffQuery` / `_fullQuery` on every `form.valueChanges`. A concrete subclass declares only:
- `_entityClass`, `_entityTable`, `_entityIdField` (required)
- `_entityNameField` (optional)
- `_entitySecondIdField`, `_entityExtraIdField` (multi-row, when needed; `_entityExtraIdField` only when the secondary key alone isn't unique)
- `protected override isMainEntity = true;` for main-entity services
- inject the feature's `*HandlerService`
- call `this.init()` in the constructor

`HandlerService` (one per main entity, shared by all its editors — e.g. all Creature editors use `CreatureHandlerService`):
- Holds `_selected` entity id.
- Tracks per-table unsaved status in `_statusMap`; exposes `is*Unsaved` readonly Signals consumed by the sidebar.
- Registered as `canActivate` guard on its editor routes; redirects to `/` when no entity selected.

Select pair (`Select*Component` + `Select*Service`):
- Service declares `entityTable`, `entityIdField`, optional `entityNameField`, `fieldList` (searchable fields).
- Component renders search via `@siemens/ngx-datatable`.
- Row click → `handlerService.select(false, id, name)`. `CreateComponent` button → `handlerService.select(true, newId)` (new-entity mode).

## SQL generation

`MysqlQueryService` (`@keira/shared/db-layer`) generates SQL. Key methods:
- `getUpdateQuery<T>(table, idField, currentRow, newRow)` — diff `UPDATE`.
- `getFullDeleteInsertQuery<T>(table, rows, idField, [secondIdField], [extraIdField])` — atomic `DELETE` + `INSERT`.
- `query<T>(sql)` — custom query.

**Squel is a global** (`declare const squel: ...` in `mysql-query.service.ts`) — do not import it. Vitest setup loads it for tests. Use `squelConfig` from `@keira/shared/config` to standardise SQL flavour.

`MysqlService` / `SqliteService` only load under Electron; guard Electron-only code with `ElectronService.isElectron()`. Under `ng:serve:web` they no-op.

## Selectors

Add a "..." picker next to a field:
- Single value → `SingleValueSelectorBtnComponent` + an `Option[]` in `libs/shared/acore-world-model/src/options/`.
- Bitmask → `FlagsSelectorBtnComponent` + a `Flag[]` in `libs/shared/acore-world-model/src/flags/` (bits start at 0).
- MySQL/DBC search → matching component under `libs/shared/selectors/src/selectors/`.

Add the selector component to the host's standalone `imports: [...]`. Common inputs: `[control]` (FormControl), `[config]` (`{ options | flags, name }`), optional `[modalClass]`, optional `[disabled]`.

## Adding a new editor

1. Model row in `libs/shared/acore-world-model/src/entities/<table>.type.ts`: class with field defaults + `*_TABLE`, `*_ID` (and optional `*_NAME`, `*_SEARCH_FIELDS`). Re-export from `src/index.ts`.
2. Pick flavour (above).
3. Place under an existing feature lib if it shares a main entity; otherwise create `libs/features/<name>` mirroring `libs/features/game-tele`, tagged `"scope:features"` in `project.json`.
4. Service: extend the base, set `_entity*` fields, inject `*HandlerService`, call `this.init()`.
5. Component: extend matching base; template uses `keira-top-bar`, `keira-query-output`, field inputs, selectors.
6. Handler: add `*_TABLE` to `_statusMap`; expose `is*Unsaved` Signal.
7. Route: append to `apps/keira/src/app/routes.ts` with `canActivate: [TheHandlerService]`; re-export component from feature lib `src/index.ts`.
8. Sidebar entry: `libs/main/main-window/src/sidebar/`.
9. Tests: `.service.spec.ts` (unit) + `.integration.spec.ts` (PageObject from `@keira/shared/test-utils`).

## Testing

- Vitest via `@analogjs/vite-plugin-angular`. Each lib has `vitest.config.ts` wrapping the root `vitest.base.config.ts`.
- Native Vitest API: `vi.fn`, `vi.spyOn`, `expect.any`, `expect.objectContaining`. `ts-mockito` available for class mocking.
- Tests live next to source: `foo.service.spec.ts` (unit). Integration tests use `.integration.spec.ts` and the PageObject pattern from `@keira/shared/test-utils`: `PageObject`, `EditorPageObject<T>`, `MultiRowEditorPageObject<T>`, `SelectPageObject<T>`, `QueryOutputComponentPage`. Integration tests mock only the DB layer.
- **100% coverage** enforced on statements / lines / branches / functions (`vitest.base.config.ts`). For genuinely untestable branches use `/* istanbul ignore next */`.
- E2E: `apps/keira-e2e/` (Playwright).

## Conventions

- Standalone components only — no NgModules. Every template dependency must be listed in `imports: [...]`.
- `ChangeDetectionStrategy.OnPush` mandatory (ESLint: `@angular-eslint/prefer-on-push-component-change-detection`). App is zoneless (`provideZonelessChangeDetection()`); after async state mutation outside the form pipeline, call `changeDetectorRef.markForCheck()` (base `EditorService` already does this in `save`/`reload`).
- Angular Signals for cross-component reactive state (e.g. handler unsaved flags).
- DI via `inject()`, not constructor injection.
- Component selector prefix: `keira-` (kebab-case element / camelCase directive).
- Self-closing tags required in templates.
- `no-console`: only `console.warn` / `console.info` / `console.error` allowed. User-facing messages → `ToastrService`.
- Prettier 140-char width, single quotes, trailing commas. Husky pre-commit runs `pretty-quick --staged`.
