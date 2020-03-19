import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { ItemLootTemplateComponent } from './item-loot-template.component';
import { ItemLootTemplateModule } from './item-loot-template.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemLootTemplate } from '@keira-types/item-loot-template.type';
import { ItemHandlerService } from '../item-handler.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';

class ItemLootTemplatePage extends MultiRowEditorPageObject<ItemLootTemplateComponent> {}

describe('ItemLootTemplate integration tests', () => {
  let component: ItemLootTemplateComponent;
  let fixture: ComponentFixture<ItemLootTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: ItemHandlerService;
  let page: ItemLootTemplatePage;

  const id = 1234;

  const originalRow0 = new ItemLootTemplate();
  const originalRow1 = new ItemLootTemplate();
  const originalRow2 = new ItemLootTemplate();
  originalRow0.Entry = originalRow1.Entry = originalRow2.Entry = id;
  originalRow0.Item = 0;
  originalRow1.Item = 1;
  originalRow2.Item = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ItemLootTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        ItemHandlerService,
      ]
    })
      .compileComponents();
  }));

  async function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(ItemHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalRow0, originalRow1, originalRow2]
    ));

    fixture = TestBed.createComponent(ItemLootTemplateComponent);
    component = fixture.componentInstance;
    page = new ItemLootTemplatePage(fixture);
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
      expect(page.getInputById('Item').disabled).toBe(true);
      expect(page.getInputById('Reference').disabled).toBe(true);
      expect(page.getInputById('Chance').disabled).toBe(true);
      expect(page.getInputById('QuestRequired').disabled).toBe(true);
      expect(page.getInputById('LootMode').disabled).toBe(true);
      expect(page.getInputById('GroupId').disabled).toBe(true);
      expect(page.getInputById('MinCount').disabled).toBe(true);
      expect(page.getInputById('MaxCount').disabled).toBe(true);
      expect(page.getInputById('Comment').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', async () => {
      const expectedQuery = 'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0, 1, 2));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');';
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
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('Chance', '1');
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 0, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 0, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('QuestRequired', '2');
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('Item', '123');
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', async () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('' +
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', async () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE `Entry` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', async () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('LootMode', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupId', 2);

      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (2));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 2, 0, 100, 0, 1, 2, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 2, 1, 1, \'\');'
      );
    });

    it('combining add, edit and delete should correctly work', async () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Chance', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2, 3));\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 1, 0, 10, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 3, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `item_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 10, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 3, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', async () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('Item', 0);

      page.expectUniqueError();
    });
  });

});
