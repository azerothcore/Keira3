import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { CreatureText } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTextComponent } from './creature-text.component';
import Spy = jasmine.Spy;
import { instance, mock } from 'ts-mockito';
class CreatureTextPage extends MultiRowEditorPageObject<CreatureTextComponent> {}

describe('CreatureText integration tests', () => {
  let fixture: ComponentFixture<CreatureTextComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTextPage;

  const id = 1234;

  const originalRow0 = new CreatureText();
  const originalRow1 = new CreatureText();
  const originalRow2 = new CreatureText();
  originalRow0.CreatureID = originalRow1.CreatureID = originalRow2.CreatureID = id;
  originalRow0.ID = 0;
  originalRow1.ID = 1;
  originalRow2.ID = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureTextComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [CreatureHandlerService, SaiCreatureHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(CreatureTextComponent);
    page = new CreatureTextPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('GroupID').disabled).toBe(true);
      expect(page.getInputById('ID').disabled).toBe(true);
      expect(page.getInputById('Text').disabled).toBe(true);
      expect(page.getInputById('Type').disabled).toBe(true);
      expect(page.getInputById('Language').disabled).toBe(true);
      expect(page.getInputById('Probability').disabled).toBe(true);
      expect(page.getInputById('Emote').disabled).toBe(true);
      expect(page.getInputById('Duration').disabled).toBe(true);
      expect(page.getInputById('Sound').disabled).toBe(true);
      expect(page.getInputById('BroadcastTextId').disabled).toBe(true);
      expect(page.getInputById('TextRange').disabled).toBe(true);
      expect(page.getInputById('comment').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isCreatureTextUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureTextUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureTextUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
        "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 0, 1, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 0, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');";
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
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('Probability', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('Text', 'newText');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('GroupID', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 123, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 123, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
    });

    it('adding a row, changing its values and duplicating it should correctly update the queries', () => {
      page.addNewRow();
      page.setInputValueById('Probability', '1');
      page.setInputValueById('Text', 'newText');
      page.setInputValueById('GroupID', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (0, 1));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 123, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 123, 1, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 123, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 123, 1, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE `CreatureID` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('Text', 'newText');

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupID', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (1, 2));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 1, 'newText', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 'newText', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Probability', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`ID` IN (1, 2, 3));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 1, '', 0, 0, 10, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 3, '', 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, '', 0, 0, 10, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 3, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
    });
  });
});
