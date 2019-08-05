import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureQuestitemComponent } from './creature-questitem.component';
import { CreatureQuestitemModule } from './creature-questitem.module';
import { QueryService } from '../../../../services/query.service';
import { CreatureQuestitem } from '../../../../types/creature-questitem.type';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { MultiRowEditorPageObject } from '../../../../test-utils/multi-row-editor-page-object';

class CreatureQuestitemPage extends MultiRowEditorPageObject<CreatureQuestitemComponent> {}

describe('CreatureQuestitem integration tests', () => {
  let component: CreatureQuestitemComponent;
  let fixture: ComponentFixture<CreatureQuestitemComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureQuestitemPage;

  const id = 1234;

  const originalRow0 = new CreatureQuestitem();
  const originalRow1 = new CreatureQuestitem();
  const originalRow2 = new CreatureQuestitem();
  originalRow0.CreatureEntry = originalRow1.CreatureEntry = originalRow2.CreatureEntry = id;
  originalRow0.ItemId = 0;
  originalRow1.ItemId = 1;
  originalRow2.ItemId = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureQuestitemModule,
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

    fixture = TestBed.createComponent(CreatureQuestitemComponent);
    component = fixture.componentInstance;
    page = new CreatureQuestitemPage(fixture);
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
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 0, 1, 0),\n' +
        '(1234, 0, 2, 0);';
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
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (0));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0);'
      );

      page.setInputValueById('Idx', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (0));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 0);'
      );

      page.setInputValueById('ItemId', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (123));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 123, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 123, 0);'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 0, 1, 0),\n' +
        '(1234, 0, 2, 0);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 0, 2, 0);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE `CreatureEntry` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('Idx', 1);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (1));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 1, 0),\n' +
        '(1234, 0, 2, 0);'
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Idx', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`ItemId` IN (1, 2, 3));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 10, 1, 0),\n' +
        '(1234, 0, 3, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 10, 1, 0),\n' +
        '(1234, 0, 3, 0);'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('ItemId', 0);

      page.expectUniqueError();
    });
  });
});

