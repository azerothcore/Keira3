# Testing the Gameobject feature

This is the Gameobject-specific test guide. For the general project test conventions, see [CLAUDE.md](../../../CLAUDE.md).

## Stack

- **Vitest** via `@analogjs/vite-plugin-angular`.
- **Page Object Model** — see `.agents/skills/ngx-page-object-model/SKILL.md`. Tests drive components through the DOM, never via component instances. No `(component as any)`, no `componentInstance.x`, no signal reads on the component.
- Helpers live in `libs/shared/test-utils/src/lib/editor-page-object.ts`.

## Canonical example

`libs/features/creature/src/creature-template/creature-template.integration.spec.ts` is the gold-standard integration spec. Mirror its shape when adding new tests.

## Per-editor checklist

For each editor in `libs/features/gameobject/src/<editor>/`:

1. **Schema-sweep test** — every editable field flows into the diff query.
   ```ts
   it('schema sweep: every editable field flows into the diff query', async () => {
     const { page } = setup(false);
     // MultiRow: click a row first
     // page.clickRowOfDatatable(0); await page.whenReady();
     const written = await page.changeAllFieldsAsync(originalEntity, ['VerifiedBuild']);
     for (const field of Object.keys(written)) {
       page.expectDiffQueryToContain('`' + field + '`');
     }
   });
   ```
2. **Error-path test** — the save query failure shows an error toast.
   ```ts
   it('shows an error toast when the save query fails', async () => {
     const { querySpy, page } = setup(false);
     page.setInputValueById('<some field>', 'x');
     querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
     page.clickExecuteQuery();
     await page.whenReady();
     page.expectErrorToastVisible();
   });
   ```
3. **One test per `*-selector-btn`** in the editor's template — see the helper-kind table below.

## Selector helper table

| Template element | Helper | Mock |
|---|---|---|
| `keira-flags-selector-btn` | `openFlagsAndToggle(field, [bit1, bit2])` | none |
| `keira-single-value-selector-btn` | `openSelectorAndPickRow(field, rowIndex)` (no search) | none |
| `keira-faction-selector-btn` | `openSelectorAndPickRow(field, 0, { clickSearch: true })` | `MysqlQueryService.query` (or `SqliteQueryService.query` for DBC-backed selectors) |
| `keira-item-selector-btn` | same | `MysqlQueryService.query` |
| `keira-map-selector-btn` | same | `SqliteQueryService.query` |
| `keira-area-selector-btn` | same | `SqliteQueryService.query` (rows shape: `{ m_ID, m_ParentAreaID, m_AreaName_lang }`) |

`MultiRow*` editors must click an existing row first (`page.clickRowOfDatatable(N); await page.whenReady();`) before opening the selector — the row drives the form.

## Gameobject-specific gotchas

1. **`gameobject-template` has no modal `*-selector-btn`.** The `type` and `IconName` fields render an inline `keira-generic-option-selector` (ngx-select wrapper). Don't write selector-modal tests for this editor. Coverage of these fields is provided by the schema-sweep test, which drives ngx-select wrappers automatically via `setNgxSelectValueByIndex` / nested-`<select>` handling inside `changeAllFieldsAsync`.
2. **`GameobjectHandlerService.select()` propagates to `SaiGameobjectHandlerService` with `source_type: 1`** — distinct from Creature's `source_type: 0`. Any SAI integration test must assert `source_type: 1`. If a test or fixture asserts `0`, the test is wrong — do not "fix" the production code.
3. **`gameobject-loot-template` render is gated** on the parent template's `type` ∈ {3, 25} *and* a non-zero `Data1` (lootid). Render-presence tests must set both via the `setup(creatingNew, lootId, type)` helper:
   - `setup(true, 0)` → alert is shown (lootId === 0).
   - `setup(true, 1234, 5)` → alert is shown (type not 3/25).
   - `setup(false, 1234, 3)` → `<keira-loot-editor>` is rendered.
4. **DB query service routing.** `keira-area-selector-btn` and `keira-map-selector-btn` read DBC data — mock `SqliteQueryService.query`. `keira-faction-selector-btn`, `keira-item-selector-btn` and `keira-creature-selector-btn` read MySQL — mock `MysqlQueryService.query`.
5. **`ToastrModule.forRoot()` required for `expectErrorToastVisible()`.** Most integration specs already import it. If the toast assertion silently fails, the smell is `instance(mock(ToastrService))` instead of the module import.
6. **`gameobject-template`'s preview pane** mounts a `<keira-model-3d-viewer>` (Three.js). Tests already mock `Model3DViewerService.generateModels` to avoid rendering Three.js in JSDOM — keep that pattern when adding tests that touch the preview.

## Test commands

```bash
nx test keira-features-gameobject              # run all tests in the feature
nx test keira-features-gameobject --skip-nx-cache   # if results look stale
npx prettier --check libs/features/gameobject/src   # format check
nx lint keira-features-gameobject              # lint
```
