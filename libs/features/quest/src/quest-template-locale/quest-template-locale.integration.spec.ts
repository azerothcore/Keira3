import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestTemplateLocale } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateLocaleComponent } from './quest-template-locale.component';

class QuestTemplateLocalePage extends MultiRowEditorPageObject<QuestTemplateLocaleComponent> {}

describe('QuestTemplateLocale integration tests', () => {
  const id = 1234;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        QuestTemplateLocaleComponent,
        TranslateTestingModule,
      ],
      providers: [QuestHandlerService, { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalRow = new QuestTemplateLocale();
    originalRow.ID = id;

    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow]));
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      initializeServicesSpy.and.callThrough();
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
      expect(handlerService.isQuestTemplateLocaleUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isQuestTemplateLocaleUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isQuestTemplateLocaleUnsaved).toBe(false);
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
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
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
});
