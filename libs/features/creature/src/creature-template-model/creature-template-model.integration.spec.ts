import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureTemplateModel } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateModelComponent } from './creature-template-model.component';
import Spy = jasmine.Spy;

class CreatureTemplateModelPage extends MultiRowEditorPageObject<CreatureTemplateModelComponent> {}

xdescribe('CreatureTemplateModel integration tests', () => {
  let fixture: ComponentFixture<CreatureTemplateModelComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateModelPage;

  const CreatureID = 1234;

  const originalRow0 = new CreatureTemplateModel();
  const originalRow1 = new CreatureTemplateModel();
  const originalRow2 = new CreatureTemplateModel();
  originalRow0.CreatureID = originalRow1.CreatureID = originalRow2.CreatureID = CreatureID;
  originalRow0.Idx = 0;
  originalRow1.Idx = 1;
  originalRow2.Idx = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureTemplateModelComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [CreatureHandlerService, SaiCreatureHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${CreatureID}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(CreatureTemplateModelComponent);
    page = new CreatureTemplateModelPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('Idx').disabled).toBe(true);
      expect(page.getInputById('CreatureDisplayID').disabled).toBe(true);
      expect(page.getInputById('DisplayScale').disabled).toBe(true);
      expect(page.getInputById('Probability').disabled).toBe(true);
      expect(page.getInputById('VerifiedBuild').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    xit('should correctly update the unsaved status', () => {
      expect(handlerService.isCreatureTemplateModelUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureTemplateModelUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureTemplateModelUnsaved).toBe(false);
    });

    xit('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`idx` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
        "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
        "(1, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
        "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);";
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

    xit('adding a row and changing its values should correctly update the queries', () => {
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.setInputValueById('CreatureDisplayID', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.setInputValueById('DisplayScale', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 1, 1, 1, 12340);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 1, 1, 1, 12340);',
      );

      page.setInputValueById('Idx', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (123));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
    });

    xit('adding a row changing its values and duplicate it should correctly update the queries', () => {
      page.addNewRow();
      page.setInputValueById('CreatureDisplayID', '1');
      page.setInputValueById('DisplayScale', '2');
      page.setInputValueById('Idx', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (123, 0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          '(1234, 0, 383, 1, 1, 12340);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          '(1234, 0, 383, 1, 1, 12340);',
      );
    });
  });

  xdescribe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1, 2));\n');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_model` WHERE `CreatureID` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('CreatureDisplayID', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('DisplayScale', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1, 2));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(1, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('DisplayScale', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1, 2, 3));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(1, 1234, 0, 0, 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(3, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(3, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('guid', 0);

      page.expectUniqueError();
    });

    xit('changing a value via MapSelector should correctly work', waitForAsync(async () => {
      const field = 'CreatureDisplayID';
      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'query').and.returnValue(of([{ m_ID: 123, m_MapName_lang1: 'Mock Map' }]));

      // because this is a multi-row editor
      page.clickRowOfDatatable(0);
      await page.whenReady();

      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickSearchBtn();
      await fixture.whenStable();
      page.clickRowOfDatatableInModal(0);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 123, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, 0, 123, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1234, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1234, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);\n",
      );
    }));
  });
});
