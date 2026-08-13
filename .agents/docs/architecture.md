# Lib map

`libs/features/<name>/` — one lib per editor domain: `creature`, `quest`, `item`, `gameobject`, `spell`, `smart-scripts`, `conditions`, `gossip`, `trainer`, `texts`, `other-loots`, `dashboard`, `sql-editor`, `game-tele`, `unused-guid-search`.

`libs/main/{connection-window,main-window}/` — shell. Sidebar entries: `libs/main/main-window/src/sidebar/`.

`libs/shared/`:
- `acore-world-model` — DB row classes + `*_TABLE`, `*_ID` constants (and optional `*_NAME`, `*_SEARCH_FIELDS`) in `src/entities/`; dropdown `Option[]` arrays in `src/options/`; bitmask `Flag[]` arrays in `src/flags/`. New tables go here first; re-export from `src/index.ts`.
- `base-abstract-classes` — editor / handler / select base classes (see [editor pattern](editor-pattern.md)).
- `base-editor-components` — `TopBarComponent`, `EditorButtonsComponent`, `QueryOutputComponent`, `CreateComponent`, `IconComponent`, `ModalConfirmComponent`, `HighlightjsWrapperComponent`.
- `db-layer` — `MysqlService`, `SqliteService` (Electron-only), `MysqlQueryService` (Squel SQL builder), `SqliteQueryService`.
- `selectors` — `SingleValueSelectorBtnComponent`, `FlagsSelectorBtnComponent`; concrete pickers in `src/selectors/`.
- `sai-editor` — reusable Smart-AI editor, embedded in `smart-scripts`, `creature`, `gameobject` (creature additionally uses `SaiCreatureHandlerService`).
- `loot-editor` — `*_loot_template` building blocks.
- `test-utils` — PageObject base classes for integration tests.
- `utils` — `SubscriptionHandler` (base that auto-unsubscribes in `ngOnDestroy`), `compareObjFn`, `getPartial`, `ModelForm` type.
- `common-services` — `ElectronService` (wraps `window.require`, exposes `isElectron()`), `ConfigService`, `LocationService`.
- `config` — `KEIRA_APP_CONFIG_TOKEN`, `squelConfig`.
