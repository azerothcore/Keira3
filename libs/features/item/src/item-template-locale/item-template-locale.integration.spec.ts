import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ItemTemplateLocale } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemTemplateLocaleComponent } from './item-template-locale.component';

class ItemTemplateLocalePage extends MultiRowEditorPageObject<ItemTemplateLocaleComponent> {}

describe('ItemTemplateLocale integration tests', () => {
  const id = 1234;
  const columns = '`ID`, `locale`, `Name`, `Description`, `VerifiedBuild`';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, ItemTemplateLocaleComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        ItemHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new ItemTemplateLocale();
    originalRow.ID = id;
    originalRow.locale = 'deDE';

    const handlerService = TestBed.inject(ItemHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));

    const fixture = TestBed.createComponent(ItemTemplateLocaleComponent);
    const page = new ItemTemplateLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, querySpy, page };
  }

  it('starts empty for a new entry, its fields disabled', () => {
    const { page } = setup(true);

    page.expectDiffQueryToBeEmpty();
    page.expectFullQueryToBeEmpty();
    expect(page.getEditorTableRowsCount()).toBe(0);
    expect(page.getInputById('locale-name').disabled).toBe(true);
  });

  it('tells the handler a locale is unsaved', () => {
    const { page, handlerService } = setup(true);

    expect(handlerService.isItemTemplateLocaleUnsaved()).toBe(false);
    page.addNewRow();
    expect(handlerService.isItemTemplateLocaleUnsaved()).toBe(true);
    page.deleteRow();
    expect(handlerService.isItemTemplateLocaleUnsaved()).toBe(false);
  });

  it('adds locales, writes them and executes the query', () => {
    const { page, querySpy } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    page.setInputValueById('locale-name', 'test');
    page.addNewRow();

    const expected =
      "DELETE FROM `item_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('0', '1'));\n" +
      `INSERT INTO \`item_template_locale\` (${columns}) VALUES\n` +
      "(1234, '0', 'test', '', 0),\n" +
      "(1234, '1', '', '', 0);";
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });

  it('reads the existing locales', () => {
    const { page } = setup(false);

    expect(page.getEditorTableRowsCount()).toBe(1);
    page.expectFullQueryToContain('DELETE FROM `item_template_locale` WHERE (`ID` = 1234);');
  });
});
