import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureQuestitemComponent } from './creature-questitem.component';
import { CreatureQuestitemModule } from './creature-questitem.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureQuestitem } from '@keira-types/creature-questitem.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class CreatureQuestitemPage extends MultiRowEditorPageObject<CreatureQuestitemComponent> {}

describe('CreatureQuestitem integration tests', () => {
  let component: CreatureQuestitemComponent;
  let fixture: ComponentFixture<CreatureQuestitemComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureQuestitemPage;

  const id = 1234;

  const originalRow0 = new CreatureQuestitem();
  const originalRow1 = new CreatureQuestitem();
  const originalRow2 = new CreatureQuestitem();
  originalRow0.CreatureEntry = originalRow1.CreatureEntry = originalRow2.CreatureEntry = id;
  originalRow0.Idx = 0;
  originalRow1.Idx = 1;
  originalRow2.Idx = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureQuestitemModule,
        RouterTestingModule,
      ],
      providers: [
        CreatureHandlerService,
        SaiCreatureHandlerService,
      ],
    })
      .compileComponents();
  }));

  async function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalRow0, originalRow1, originalRow2]
    ));

    fixture = TestBed.createComponent(CreatureQuestitemComponent);
    component = fixture.componentInstance;
    page = new CreatureQuestitemPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    await page.whenStable();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', async () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('Idx').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', async () => {
      const expectedQuery = 'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 0, 0),\n' +
        '(1234, 2, 0, 0);';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.clickExecuteQuery();

      await page.whenStable();
      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', async () => {
      page.addNewRow();
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (0));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0);'
      );

      page.setInputValueById('ItemId', '1');
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (0));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 1, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 1, 0);'
      );

      page.setInputValueById('Idx', '123');
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (123));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 123, 1, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 123, 1, 0);'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', async () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 0, 0),\n' +
        '(1234, 2, 0, 0);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', async () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 2, 0, 0);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE `CreatureEntry` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', async () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('ItemId', 1);

      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (1));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 1, 0),\n' +
        '(1234, 2, 0, 0);'
      );
    });

    it('combining add, edit and delete should correctly work', async () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('ItemId', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234) AND (`Idx` IN (1, 2, 3));\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 10, 0),\n' +
        '(1234, 3, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questitem` WHERE (`CreatureEntry` = 1234);\n' +
        'INSERT INTO `creature_questitem` (`CreatureEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 10, 0),\n' +
        '(1234, 3, 0, 0);'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', async () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('Idx', 0);

      page.expectUniqueError();
    });
  });
});

