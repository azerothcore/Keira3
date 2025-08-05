import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureText } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTextComponent } from './creature-text.component';
class CreatureTextPage extends MultiRowEditorPageObject<CreatureTextComponent> {}

describe('CreatureText integration tests', () => {
  const id = 1234;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureTextComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalRow0 = new CreatureText();
    const originalRow1 = new CreatureText();
    const originalRow2 = new CreatureText();
    originalRow0.CreatureID = originalRow1.CreatureID = originalRow2.CreatureID = id;
    originalRow0.GroupID = 0;
    originalRow1.GroupID = 1;
    originalRow2.GroupID = 2;

    const handlerService: CreatureHandlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(CreatureTextComponent);
    const component = fixture.componentInstance;
    const page = new CreatureTextPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, component, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('GroupID').disabled).toBe(true);
      expect(page.getInputById('ID').disabled).toBe(true);
      expect(page.getInputById('Text').disabled).toBe(true);
      expect(page.getDebugElementByCss<HTMLSelectElement>('#Type select').nativeElement.disabled).toBe(true);
      expect(page.getInputById('Language').disabled).toBe(true);
      expect(page.getInputById('Probability').disabled).toBe(true);
      expect(page.getDebugElementByCss<HTMLSelectElement>('#Emote select').nativeElement.disabled).toBe(true);
      expect(page.getInputById('Duration').disabled).toBe(true);
      expect(page.getInputById('Sound').disabled).toBe(true);
      expect(page.getInputById('BroadcastTextId').disabled).toBe(true);
      expect(page.getDebugElementByCss<HTMLSelectElement>('#TextRange select').nativeElement.disabled).toBe(true);
      expect(page.getInputById('comment').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      expect(handlerService.isCreatureTextUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureTextUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureTextUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
        "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 1, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');";
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
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
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
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
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
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('ID', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
    });

    it('adding a row, changing its values and duplicating it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('Probability', '1');
      page.setInputValueById('Text', 'newText');
      page.setInputValueById('ID', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0, 1));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 123, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 123, 'newText', 0, 0, 1, 0, 0, 0, 0, 0, '');",
      );
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (1, 2));');
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
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('Text', 'newText');

      page.clickRowOfDatatable(2);
      page.setInputValueById('ID', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (1, 2));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 1, 0, 'newText', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, 'newText', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 2, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Probability', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (1, 2, 3));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 1, 0, '', 0, 0, 10, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 3, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, '', 0, 0, 10, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 3, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
    });
  });
});
