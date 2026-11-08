import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NpcTextLocale } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { NpcTextHandlerService } from '../npc-text/npc-text-handler.service';
import { NpcTextLocaleComponent } from './npc-text-locale.component';

class NpcTextLocalePage extends MultiRowEditorPageObject<NpcTextLocaleComponent> {}

describe('NpcTextLocale integration tests', () => {
  const id = 1234;
  const columns =
    '`ID`, `Locale`, `Text0_0`, `Text0_1`, `Text1_0`, `Text1_1`, `Text2_0`, `Text2_1`, `Text3_0`, `Text3_1`, `Text4_0`, `Text4_1`, `Text5_0`, `Text5_1`, `Text6_0`, `Text6_1`, `Text7_0`, `Text7_1`';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, NpcTextLocaleComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        NpcTextHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new NpcTextLocale();
    originalRow.ID = id;
    originalRow.Locale = 'deDE';

    const handlerService = TestBed.inject(NpcTextHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));

    const fixture = TestBed.createComponent(NpcTextLocaleComponent);
    const page = new NpcTextLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, querySpy, page };
  }

  it('starts empty for a new entry, its fields disabled', () => {
    const { page } = setup(true);

    page.expectDiffQueryToBeEmpty();
    page.expectFullQueryToBeEmpty();
    expect(page.getEditorTableRowsCount()).toBe(0);
    expect(page.getInputById('locale-text0-0').disabled).toBe(true);
  });

  it('tells the handler a locale is unsaved', () => {
    const { page, handlerService } = setup(true);

    expect(handlerService.isNpcTextLocaleUnsaved()).toBe(false);
    page.addNewRow();
    expect(handlerService.isNpcTextLocaleUnsaved()).toBe(true);
    page.deleteRow();
    expect(handlerService.isNpcTextLocaleUnsaved()).toBe(false);
  });

  it('adds locales, writes them and executes the query', () => {
    const { page, querySpy } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    page.setInputValueById('locale-text0-0', 'test');
    page.addNewRow();

    const expected =
      "DELETE FROM `npc_text_locale` WHERE (`ID` = 1234) AND (`Locale` IN ('0', '1'));\n" +
      `INSERT INTO \`npc_text_locale\` (${columns}) VALUES\n` +
      "(1234, '0', 'test', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),\n" +
      "(1234, '1', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');";
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });

  it('reads the existing locales', () => {
    const { page } = setup(false);

    expect(page.getEditorTableRowsCount()).toBe(1);
    page.expectFullQueryToContain('DELETE FROM `npc_text_locale` WHERE (`ID` = 1234);');
  });
});
