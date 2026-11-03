import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameobjectTemplateLocale } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateLocaleComponent } from './gameobject-template-locale.component';

class GameobjectTemplateLocalePage extends MultiRowEditorPageObject<GameobjectTemplateLocaleComponent> {}

describe('GameobjectTemplateLocale integration tests', () => {
  const id = 1234;
  const columns = '`entry`, `locale`, `name`, `castBarCaption`, `VerifiedBuild`';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, GameobjectTemplateLocaleComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new GameobjectTemplateLocale();
    originalRow.entry = id;
    originalRow.locale = 'deDE';

    const handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));

    const fixture = TestBed.createComponent(GameobjectTemplateLocaleComponent);
    const page = new GameobjectTemplateLocalePage(fixture);
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

    expect(handlerService.isGameobjectTemplateLocaleUnsaved()).toBe(false);
    page.addNewRow();
    expect(handlerService.isGameobjectTemplateLocaleUnsaved()).toBe(true);
    page.deleteRow();
    expect(handlerService.isGameobjectTemplateLocaleUnsaved()).toBe(false);
  });

  it('adds locales, writes them and executes the query', () => {
    const { page, querySpy } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    page.setInputValueById('locale-name', 'test');
    page.addNewRow();

    const expected =
      "DELETE FROM `gameobject_template_locale` WHERE (`entry` = 1234) AND (`locale` IN ('0', '1'));\n" +
      `INSERT INTO \`gameobject_template_locale\` (${columns}) VALUES\n` +
      "(1234, '0', 'test', '', 0),\n" +
      "(1234, '1', '', '', 0);";
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });

  it('reads the existing locales', () => {
    const { page } = setup(false);

    expect(page.getEditorTableRowsCount()).toBe(1);
    page.expectFullQueryToContain('DELETE FROM `gameobject_template_locale` WHERE (`entry` = 1234);');
  });
});
