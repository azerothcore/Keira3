# Editor pattern

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
