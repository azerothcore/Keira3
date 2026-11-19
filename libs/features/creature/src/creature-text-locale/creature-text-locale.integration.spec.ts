import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { CreatureTextLocale } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTextLocaleComponent } from './creature-text-locale.component';

class CreatureTextLocalePage extends MultiRowEditorPageObject<CreatureTextLocaleComponent> {}

describe('CreatureTextLocale integration tests', () => {
  const id = 1234;
  const columns = '`CreatureID`, `GroupID`, `ID`, `Locale`, `Text`';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, CreatureTextLocaleComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new CreatureTextLocale();
    originalRow.CreatureID = id;
    originalRow.Locale = 'deDE';

    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));

    const fixture = TestBed.createComponent(CreatureTextLocaleComponent);
    const page = new CreatureTextLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, querySpy, page };
  }

  it('tells the handler a locale is unsaved', () => {
    const { page, handlerService } = setup(true);

    expect(handlerService.isCreatureTextLocaleUnsaved()).toBe(false);
    page.addNewRow();
    expect(handlerService.isCreatureTextLocaleUnsaved()).toBe(true);
    page.deleteRow();
    expect(handlerService.isCreatureTextLocaleUnsaved()).toBe(false);
  });

  it('keeps one row per locale of the same GroupID', () => {
    const { page } = setup(true);
    const locale = () => page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;

    page.addNewRow();
    page.setInputValueById('locale-group-i-d', 0);
    page.setInputValue(locale(), '0: deDE');
    page.addNewRow();
    page.setInputValueById('locale-group-i-d', 0);
    page.setInputValue(locale(), '1: esES');

    expect(page.formError.hidden).toBe(true);
    page.expectDiffQueryToContain(
      'DELETE FROM `creature_text_locale` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
        `INSERT INTO \`creature_text_locale\` (${columns}) VALUES\n` +
        "(1234, 0, 0, 'deDE'" +
        ", ''),\n" +
        "(1234, 0, 0, 'esES'" +
        ", '');",
    );

    page.setInputValue(locale(), '0: deDE');
    expect(page.formError.hidden).toBe(false);
  });

  it('reads the existing locales', () => {
    const { page } = setup(false);

    expect(page.getEditorTableRowsCount()).toBe(1);
  });
});
