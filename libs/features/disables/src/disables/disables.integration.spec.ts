import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Disables } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { DisablesHandlerService } from '../disables-handler.service';
import { DisablesComponent } from './disables.component';

class DisablesPage extends MultiRowEditorPageObject<DisablesComponent> {}

describe('Disables integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, DisablesComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        DisablesHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (creatingNew: boolean) => {
    const handlerService = TestBed.inject(DisablesHandlerService);
    handlerService['_selected'] = '1234';
    handlerService.isNew = creatingNew;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    const existing = Object.assign(new Disables(), { sourceType: 1234, entry: 7 });
    const selectAll = vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new DisablesPage(TestBed.createComponent(DisablesComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, selectAll, handlerService };
  };

  it('reads the rows', () => {
    const { page, selectAll } = setup(false);

    expect(selectAll).toHaveBeenCalledWith('disables', 'sourceType', '1234');
    expect(page.getEditorTableRowsCount()).toBe(1);
    expect(page.query('#editor-help')).toBeTruthy();
  });

  it('adds a row, then executes the query', () => {
    const { page, querySpy, handlerService } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isDisablesUnsaved()).toBe(true);
    page.setInputValueById('f-entry', 55);

    const expected =
      'DELETE FROM `disables` WHERE (`sourceType` = 1234) AND (`entry` IN (55));\n' +
      'INSERT INTO `disables` (`sourceType`, `entry`, `flags`, `params_0`, `params_1`, `comment`) VALUES\n' +
      "(1234, 55, 0, '', '', '');";
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });
});
