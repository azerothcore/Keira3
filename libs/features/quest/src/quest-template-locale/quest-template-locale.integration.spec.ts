import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { QuestTemplateLocale } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateLocaleComponent } from './quest-template-locale.component';

class QuestTemplateLocalePage extends MultiRowEditorPageObject<QuestTemplateLocaleComponent> {}

describe('QuestTemplateLocale integration tests', () => {
  const id = 1234;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), QuestTemplateLocaleComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        QuestHandlerService,
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        { provide: Model3DViewerService, useValue: { generateModels: () => new Promise((resolve) => resolve({ destroy: () => {} })) } },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new QuestTemplateLocale();
    originalRow.ID = id;

    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));
    const initializeServicesSpy = vi.spyOn(TestBed.inject(QuestPreviewService), 'initializeServices').mockImplementation(() => undefined);
    if (creatingNew) {
      initializeServicesSpy.mockRestore();
    }

    const fixture = TestBed.createComponent(QuestTemplateLocaleComponent);
    const page = new QuestTemplateLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('id').disabled).toBe(true);
      expect(page.getInputById('title').disabled).toBe(true);
      expect(page.getInputById('details').disabled).toBe(true);
      expect(page.getInputById('objectives').disabled).toBe(true);
      expect(page.getInputById('end-text').disabled).toBe(true);
      expect(page.getInputById('completed-text').disabled).toBe(true);
      expect(page.getInputById('objective-text-1').disabled).toBe(true);
      expect(page.getInputById('objective-text-2').disabled).toBe(true);
      expect(page.getInputById('objective-text-3').disabled).toBe(true);
      expect(page.getInputById('objective-text-4').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isQuestTemplateLocaleUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isQuestTemplateLocaleUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isQuestTemplateLocaleUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        "DELETE FROM `quest_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('0', '1', '2'));\n" +
        'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
        '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
        "(1234, '0', '', '', '', '', '', '', '', '', '', 0),\n" +
        "(1234, '1', '', '', '', '', '', '', '', '', '', 0),\n" +
        "(1234, '2', '', '', '', '', '', '', '', '', '', 0);";
      querySpy.mockClear();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        "DELETE FROM `quest_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('0'));\n" +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, '0', '', '', '', '', '', '', '', '', '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_locale` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, '0', '', '', '', '', '', '', '', '', '', 0);",
      );

      page.setInputValueById('title', 'test');
      page.expectDiffQueryToContain(
        "DELETE FROM `quest_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('0'));\n" +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, '0', 'test', '', '', '', '', '', '', '', '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_locale` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, '0', 'test', '', '', '', '', '', '', '', '', 0);",
      );

      page.setInputValueById('completed-text', 'test2');
      page.expectDiffQueryToContain(
        "DELETE FROM `quest_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('0'));\n" +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, '0', 'test', '', '', '', 'test2', '', '', '', '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_locale` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, '0', 'test', '', '', '', 'test2', '', '', '', '', 0);",
      );

      const locale = page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;
      page.setInputValue(locale, '0: deDE');
      page.expectDiffQueryToContain(
        "DELETE FROM `quest_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('deDE'));\n" +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'deDE', 'test', '', '', '', 'test2', '', '', '', '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_locale` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'deDE', 'test', '', '', '', 'test2', '', '', '', '', 0);",
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('title', '1');
      page.setInputValueById('completed-text', '2');

      const locale = page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;
      page.setInputValue(locale, '0: deDE');

      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        "DELETE FROM `quest_template_locale` WHERE (`ID` = 1234) AND (`locale` IN ('deDE', '0'));\n" +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'deDE', '1', '', '', '', '2', '', '', '', '', 0),\n" +
          "(1234, '0', '1', '', '', '', '2', '', '', '', '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_locale` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_locale` (`ID`, `locale`, `Title`, `Details`, `Objectives`, `EndText`, `CompletedText`, ' +
          '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'deDE', '1', '', '', '', '2', '', '', '', '', 0),\n" +
          "(1234, '0', '1', '', '', '', '2', '', '', '', '', 0);",
      );
    });
  });

  describe('Editing existing', () => {
    // HTML ids in this template are kebab-case; entity columns are PascalCase.
    // Map kept explicit so a regression (added column without matching input, or vice versa) surfaces here.
    const inputIdToColumn: Record<string, string> = {
      title: 'Title',
      details: 'Details',
      objectives: 'Objectives',
      'end-text': 'EndText',
      'completed-text': 'CompletedText',
      'objective-text-1': 'ObjectiveText1',
      'objective-text-2': 'ObjectiveText2',
      'objective-text-3': 'ObjectiveText3',
      'objective-text-4': 'ObjectiveText4',
    };

    it('schema sweep: every editable field flows into the diff query', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);

      const locale = page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;
      page.setInputValue(locale, '0: deDE');

      let i = 1;
      for (const htmlId of Object.keys(inputIdToColumn)) {
        page.setInputValueById(htmlId, `v${i++}`);
      }

      page.expectDiffQueryToContain('`locale`');
      for (const column of Object.values(inputIdToColumn)) {
        page.expectDiffQueryToContain('`' + column + '`');
      }
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.clickRowOfDatatable(0);
      page.setInputValueById('title', 'Shin');

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });
  });
});
