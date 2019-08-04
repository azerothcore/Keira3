import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { NpcTrainerComponent } from './npc-trainer.component';
import { NpcTrainerModule } from './npc-trainer.module';
import { QueryService } from '../../../../services/query.service';
import { NpcTrainer } from '../../../../types/npc-trainer.type';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { MultiRowEditorPageObject } from '../../../../test-utils/multi-row-editor-page-object';

class NpcTrainerPage extends MultiRowEditorPageObject<NpcTrainerComponent> {}

describe('NpcTrainer integration tests', () => {
  let component: NpcTrainerComponent;
  let fixture: ComponentFixture<NpcTrainerComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: NpcTrainerPage;

  const id = 1234;

  const originalRow0 = new NpcTrainer();
  const originalRow1 = new NpcTrainer();
  const originalRow2 = new NpcTrainer();
  originalRow0.ID = originalRow1.ID = originalRow2.ID = id;
  originalRow0.SpellID = 0;
  originalRow1.SpellID = 1;
  originalRow2.SpellID = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NpcTrainerModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalRow0, originalRow1, originalRow2] }
    ));

    fixture = TestBed.createComponent(NpcTrainerComponent);
    component = fixture.componentInstance;
    page = new NpcTrainerPage(fixture);
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
      expect(page.getInputById('SpellID').disabled).toBe(true);
      expect(page.getInputById('MoneyCost').disabled).toBe(true);
      expect(page.getInputById('ReqSkillLine').disabled).toBe(true);
      expect(page.getInputById('ReqSkillRank').disabled).toBe(true);
      expect(page.getInputById('ReqLevel').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (0, 1, 2));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 0, 0, 0, 0),\n' +
        '(1234, 2, 0, 0, 0, 0);';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (0));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0);'
      );

      page.setInputValueById('MoneyCost', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (0));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 1, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 1, 0, 0, 0);'
      );

      page.setInputValueById('ReqSkillLine', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (0));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 1, 2, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 1, 2, 0, 0);'
      );

      page.setInputValueById('SpellID', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (123));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 123, 1, 2, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 123, 1, 2, 0, 0);'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 0, 0, 0, 0),\n' +
        '(1234, 2, 0, 0, 0, 0);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0),\n' +
        '(1234, 2, 0, 0, 0, 0);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE `ID` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('ReqSkillRank', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('ReqLevel', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (1, 2));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 1, 0, 0, 1, 0),\n' +
        '(1234, 2, 0, 0, 0, 2);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 0, 0, 1, 0),\n' +
        '(1234, 2, 0, 0, 0, 2);'
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('MoneyCost', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234) AND (`SpellID` IN (1, 2, 3));\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 1, 10, 0, 0, 0),\n' +
        '(1234, 3, 0, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_trainer` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `npc_trainer` (`ID`, `SpellID`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqLevel`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 10, 0, 0, 0),\n' +
        '(1234, 3, 0, 0, 0, 0);'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('SpellID', 0);

      page.expectUniqueError();
    });
  });
});

