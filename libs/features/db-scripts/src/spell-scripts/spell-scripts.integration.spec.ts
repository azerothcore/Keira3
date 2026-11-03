import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { SpellScripts } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { SpellScriptsHandlerService } from '../spell-scripts-handler.service';
import { SpellScriptsComponent } from './spell-scripts.component';

class SpellScriptsPage extends MultiRowEditorPageObject<SpellScriptsComponent> {}

describe('SpellScripts integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, SpellScriptsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        SpellScriptsHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (rows: SpellScripts[]) => {
    const handlerService = TestBed.inject(SpellScriptsHandlerService);
    handlerService['_selected'] = '1234';
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const page = new SpellScriptsPage(TestBed.createComponent(SpellScriptsComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, handlerService };
  };

  it('tells two steps apart by their data, as the table has no key', () => {
    const step = (datalong: number) => Object.assign(new SpellScripts(), { id: 1234, command: 10, datalong });
    const { page } = setup([step(1), step(2)]);
    expect(page.getEditorTableRowsCount()).toBe(2);
    expect(page.query('#editor-help')).toBeTruthy();

    page.clickRowOfDatatable(0);
    page.setInputValueById('f-datalong', 2);
    expect(page.formError.hidden).toBe(false);
    page.setInputValueById('f-datalong', 3);
    expect(page.formError.hidden).toBe(true);
  });

  it('adds a step, then executes the query', () => {
    const { page, querySpy, handlerService } = setup([]);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isSpellScriptsUnsaved()).toBe(true);
    page.setInputValueById('f-delay', 5);

    page.expectDiffQueryToContain(
      'INSERT INTO `spell_scripts` (`id`, `effIndex`, `delay`, `command`, `datalong`, `datalong2`, `dataint`, `x`, `y`, `z`, `o`) VALUES',
    );
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain('`spell_scripts`');
  });
});
