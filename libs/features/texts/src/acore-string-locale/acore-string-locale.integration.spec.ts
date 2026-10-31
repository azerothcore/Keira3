import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AcoreStringLocale } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { AcoreStringHandlerService } from '../acore-string/acore-string-handler.service';
import { AcoreStringLocaleComponent } from './acore-string-locale.component';

class AcoreStringLocalePage extends MultiRowEditorPageObject<AcoreStringLocaleComponent> {}

describe('AcoreStringLocale integration tests', () => {
  const entry = 1234;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, AcoreStringLocaleComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        AcoreStringHandlerService,
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const deDE = new AcoreStringLocale();
    deDE.entry = entry;
    deDE.locale = 'deDE';
    deDE.content = 'Hallo';
    const itIT = new AcoreStringLocale();
    itIT.entry = entry;
    itIT.locale = 'itIT';
    itIT.content = 'Ciao';

    const handlerService = TestBed.inject(AcoreStringHandlerService);
    handlerService['_selected'] = `${entry}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [deDE, itIT]));

    const fixture = TestBed.createComponent(AcoreStringLocaleComponent);
    const page = new AcoreStringLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, querySpy, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('entry').disabled).toBe(true);
      expect(page.getInputById('locale').disabled).toBe(true);
      expect(page.getInputById('content').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isAcoreStringLocaleUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isAcoreStringLocaleUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isAcoreStringLocaleUnsaved()).toBe(false);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page, querySpy } = setup(true);
      page.addNewRow();
      page.setInputValueById('locale', 'esES');
      page.setInputValueById('content', 'Hola');
      const expectedQuery =
        "DELETE FROM `acore_string_locale` WHERE (`entry` = 1234) AND (`locale` IN ('esES'));\n" +
        'INSERT INTO `acore_string_locale` (`entry`, `locale`, `content`) VALUES\n' +
        "(1234, 'esES', 'Hola');";
      page.expectDiffQueryToContain(expectedQuery);
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string_locale` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string_locale` (`entry`, `locale`, `content`) VALUES\n' +
          "(1234, 'esES', 'Hola');",
      );
      querySpy.mockClear();

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('two rows with the same locale should show the unique error', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('locale', 'frFR');
      page.duplicateSelectedRow();
      page.setInputValueById('locale', 'frFR');
      expect(page.formError.hidden).toBe(false);
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string_locale` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string_locale` (`entry`, `locale`, `content`) VALUES\n' +
          "(1234, 'deDE', 'Hallo'),\n" +
          "(1234, 'itIT', 'Ciao');",
      );
      expect(page.getEditorTableRowsCount()).toBe(2);
    });

    it('editing a row should only replace that row', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('content', 'Salve');
      page.expectDiffQueryToContain(
        "DELETE FROM `acore_string_locale` WHERE (`entry` = 1234) AND (`locale` IN ('itIT'));\n" +
          'INSERT INTO `acore_string_locale` (`entry`, `locale`, `content`) VALUES\n' +
          "(1234, 'itIT', 'Salve');",
      );
    });

    it('deleting a row should correctly update the queries', () => {
      const { page } = setup(false);
      page.deleteRow(0);
      page.expectDiffQueryToContain("DELETE FROM `acore_string_locale` WHERE (`entry` = 1234) AND (`locale` IN ('deDE'));");
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string_locale` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string_locale` (`entry`, `locale`, `content`) VALUES\n' +
          "(1234, 'itIT', 'Ciao');",
      );
    });
  });
});
