import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { FishingLootTemplateComponent } from './fishing-loot-template.component';
import { FishingLootTemplateModule } from './fishing-loot-template.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { highlightOptions } from '@keira-config/highlight.config';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { FishingLootTemplate } from '@keira-types/fishing-loot-template.type';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

class FishingLootTemplatePage extends MultiRowEditorPageObject<FishingLootTemplateComponent> {}

describe('FishingLootTemplate integration tests', () => {
  const id = 1234;

  const originalRow0 = new FishingLootTemplate();
  const originalRow1 = new FishingLootTemplate();
  const originalRow2 = new FishingLootTemplate();
  originalRow0.Entry = originalRow1.Entry = originalRow2.Entry = id;
  originalRow0.Item = 0;
  originalRow1.Item = 1;
  originalRow2.Item = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FishingLootTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: HIGHLIGHT_OPTIONS, useValue: highlightOptions },
        FishingLootHandlerService,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(FishingLootHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of());
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalRow0, originalRow1, originalRow2]
    ));

    const fixture = TestBed.createComponent(FishingLootTemplateComponent);
    const page = new FishingLootTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, querySpy, handlerService };
  }

  describe('Creating new', () => {

    it('should correctly initialise',   waitForAsync(async () => {
      const { page } = setup(true);
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
    }));

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', waitForAsync(async () => {
      const { page, querySpy } = setup(true);
      const expectedQuery = 'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0, 1, 2));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
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

      await page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));

    it('adding a row and changing its values should correctly update the queries', waitForAsync(async () => {
      const { page } = setup(true);
      page.addNewRow();
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('Chance', '1');
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 0, 1, 0, 1, 1, \'\');'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 0, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('QuestRequired', '2');
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('Item', '123');
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
    }));
  });

  describe('Editing existing', () => {

    it('should correctly initialise',   waitForAsync(async () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      await page.expectFullQueryToContain('' +
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');');
      expect(page.getEditorTableRowsCount()).toBe(3);
    }));

    it('deleting rows should correctly work', waitForAsync(async () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1));'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2));'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE `Entry` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    }));

    it('editing existing rows should correctly work', waitForAsync(async () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('LootMode', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupId', 2);

      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (2));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 2, 0, 100, 0, 1, 2, 1, 1, \'\');'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 2, 1, 1, \'\');'
      );
    }));

    it('combining add, edit and delete should correctly work', waitForAsync(async () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Chance', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      await page.expectDiffQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2, 3));\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 1, 0, 10, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 3, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `fishing_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `fishing_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 10, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 3, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
    }));

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('Item', 0);

      page.expectUniqueError();
    });
  });

});
