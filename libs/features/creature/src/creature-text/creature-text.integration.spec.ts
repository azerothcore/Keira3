import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BroadcastText, CreatureText } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTextComponent } from './creature-text.component';
class CreatureTextPage extends MultiRowEditorPageObject<CreatureTextComponent> {
  readonly BROADCAST_DT_SELECTOR = '#broadcast-text-table';

  searchBroadcastText(): void {
    this.clickElement(this.query<HTMLButtonElement>('#broadcast-text-search-btn'));
  }
  clickBroadcastTextRow(rowIndex: number): void {
    this.clickElement(this.getDatatableCell(rowIndex, 0, true, this.BROADCAST_DT_SELECTOR));
  }
  copyBroadcastTextToRow(): void {
    this.clickElement(this.query<HTMLButtonElement>('#copy-to-creature-text-btn'));
  }
}

describe('CreatureText integration tests', () => {
  const id = 1234;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, CreatureTextComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

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
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(CreatureTextComponent);
    const component = fixture.componentInstance;
    const page = new CreatureTextPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, component, page };
  }

  /** Loads an existing creature whose texts are given as [GroupID, ID] pairs. */
  function setupWithVariants(pairs: [number, number][]) {
    const rows = pairs.map(([GroupID, ID]) => {
      const row = new CreatureText();
      row.CreatureID = id;
      row.GroupID = GroupID;
      row.ID = ID;
      row.Text = `g${GroupID}v${ID}`;
      return row;
    });

    const handlerService: CreatureHandlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = false;

    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));

    const fixture = TestBed.createComponent(CreatureTextComponent);
    const page = new CreatureTextPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page };
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
        "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 1, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 2, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');";
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
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('Probability', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('Text', 'newText');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'newText', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'newText', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('ID', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );
    });

    it('a new row should default to Type 12 (Say) and Probability 100', () => {
      const { page } = setup(true);
      page.addNewRow();

      expect(page.getDebugElementByCss<HTMLSelectElement>('#Type select').nativeElement.value).toContain('12');
      expect(page.getInputById('Probability').value).toBe('100');
    });

    it('adding new rows should move the GroupID on and leave the ID alone', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.addNewRow();

      // GroupID 0 then 1, both keeping ID 0: each new row starts its own text group.
      page.expectFullQueryToContain(
        "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" + "(1234, 1, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });

    it('adding a row, changing its values and duplicating it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('Probability', '1');
      page.setInputValueById('Text', 'newText');
      page.setInputValueById('ID', '123');
      page.duplicateSelectedRow();

      // The duplicate is another variant of the same line: same GroupID, next ID of that group.
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 123, 'newText', 12, 0, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 124, 'newText', 12, 0, 1, 0, 0, 0, 0, 0, '');",
      );
    });

    it('duplicating repeatedly should keep filling the same group', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.duplicateSelectedRow();
      page.duplicateSelectedRow();

      page.expectFullQueryToContain(
        "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });

    it('duplicating should only advance the ID within its own group', () => {
      const { page } = setup(true);
      page.addNewRow(); // GroupID 0
      page.addNewRow(); // GroupID 1, now selected
      page.duplicateSelectedRow();

      // Group 1 gets ID 1; group 0 is untouched and keeps its single ID 0.
      page.expectFullQueryToContain(
        "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 1, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });
  });

  describe('Editing a group that holds several ID variants', () => {
    const INSERT =
      'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n';

    it('should rewrite the whole group when one variant is edited, keeping its siblings', () => {
      const { page } = setupWithVariants([
        [0, 0],
        [0, 1],
        [0, 2],
      ]);

      page.clickRowOfDatatable(2);
      page.setInputValueById('Text', 'EDITED');

      // The group is listed once and comes back complete: the edit sticks and no variant is dropped.
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          INSERT +
          "(1234, 0, 0, 'g0v0', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 'g0v1', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 'EDITED', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });

    it('should not touch the groups that did not change', () => {
      const { page } = setupWithVariants([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ]);

      page.clickRowOfDatatable(3);
      page.setInputValueById('Text', 'EDITED');

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (1));\n' +
          INSERT +
          "(1234, 1, 0, 'g1v0', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 1, 'EDITED', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });

    it('should keep the surviving variants when one of them is deleted', () => {
      const { page } = setupWithVariants([
        [0, 0],
        [0, 1],
        [0, 2],
      ]);

      page.deleteRow(1);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          INSERT +
          "(1234, 0, 0, 'g0v0', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 'g0v2', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });

    it('should rewrite the group when Duplicate adds a variant to it', () => {
      const { page } = setupWithVariants([
        [0, 0],
        [0, 1],
      ]);

      page.clickRowOfDatatable(1);
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          INSERT +
          "(1234, 0, 0, 'g0v0', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 'g0v1', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 'g0v1', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });

    it('should emit only a DELETE when every variant of a group is removed', () => {
      const { page } = setupWithVariants([
        [0, 0],
        [0, 1],
        [1, 0],
      ]);

      page.deleteRow(0);
      page.deleteRow(0);

      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));');
      expect(page.getEditorTableRowsCount()).toBe(1);
    });
  });

  describe('The broadcast_text browser', () => {
    const broadcastText = { ...new BroadcastText(), ID: 25, LanguageID: 7, MaleText: 'Archers at the ready!' };

    it('should copy the id, the language and the text into the selected row', () => {
      const { page, querySpy } = setup(false);
      querySpy.mockReturnValue(of([broadcastText]));

      page.clickRowOfDatatable(0);
      page.searchBroadcastText();
      page.clickBroadcastTextRow(0);
      page.copyBroadcastTextToRow();

      expect(page.getInputById('BroadcastTextId').value).toBe('25');
      expect(page.getInputById('Language').value).toBe('7');
      expect(page.getInputById('Text').value).toBe('Archers at the ready!');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (0));\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, 'Archers at the ready!', 12, 7, 100, 0, 0, 0, 25, 0, '');",
      );
    });

    it('should keep the copy button disabled while no creature_text row is selected', () => {
      const { page, querySpy } = setup(false);
      querySpy.mockReturnValue(of([broadcastText]));

      page.searchBroadcastText();
      page.clickBroadcastTextRow(0);

      expect(page.query<HTMLButtonElement>('#copy-to-creature-text-btn').disabled).toBe(true);
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
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
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
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_text` WHERE (`CreatureID` = 1234) AND (`GroupID` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
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
          "(1234, 1, 0, 'newText', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 2, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, 'newText', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 2, 2, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
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
          "(1234, 1, 0, '', 12, 0, 10, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 3, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_text` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_text` (`CreatureID`, `GroupID`, `ID`, `Text`, `Type`, `Language`, `Probability`, `Emote`, `Duration`, `Sound`, `BroadcastTextId`, `TextRange`, `comment`) VALUES\n' +
          "(1234, 0, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 1, 0, '', 12, 0, 10, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 3, 0, '', 12, 0, 100, 0, 0, 0, 0, 0, '');",
      );
    });
  });
});
