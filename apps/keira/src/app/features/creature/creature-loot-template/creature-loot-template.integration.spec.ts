import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MultiRowEditorPageObject } from '@keira/test-utils';
import { CreatureLootTemplate } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { CreatureLootTemplateModule } from './creature-loot-template.module';
import { CreatureLootTemplateService } from './creature-loot-template.service';
import { TranslateTestingModule } from '@keira/test-utils';
import Spy = jasmine.Spy;

class CreatureLootTemplatePage extends MultiRowEditorPageObject<CreatureLootTemplateComponent> {}

describe('CreatureLootTemplate integration tests', () => {
  let fixture: ComponentFixture<CreatureLootTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureLootTemplatePage;

  const id = 1234;

  const originalRow0 = new CreatureLootTemplate();
  const originalRow1 = new CreatureLootTemplate();
  const originalRow2 = new CreatureLootTemplate();
  originalRow0.Entry = originalRow1.Entry = originalRow2.Entry = id;
  originalRow0.Item = 0;
  originalRow1.Item = 1;
  originalRow2.Item = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureLootTemplateModule, RouterTestingModule, TranslateTestingModule],
      providers: [CreatureHandlerService, SaiCreatureHandlerService],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean, lootId = id) {
    spyOn(TestBed.inject(CreatureLootTemplateService), 'getLootId').and.returnValue(of([{ lootId }]));

    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());
    const itemNamePromise = of(`MockItemName`).toPromise();
    spyOn(queryService, 'getItemNameById').and.returnValue(itemNamePromise);

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(CreatureLootTemplateComponent);
    page = new CreatureLootTemplatePage(fixture);
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

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isCreatureLootTemplateUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureLootTemplateUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureLootTemplateUnsaved).toBe(false);
    });

    xit('should reflect the item names', waitForAsync(async () => {
      page.addNewRow();
      page.detectChanges();
      await page.whenReady();
      expect(page.getDatatableCell(0, 3).innerText).toContain('MockItemName');
    }));

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
        "(1234, 1, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
        "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');";
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
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('Chance', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 0, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('QuestRequired', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('Item', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123));\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, '');",
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        '' +
          'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 1, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_loot_template` WHERE `Entry` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('LootMode', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (2));\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 2, 0, 100, 0, 1, 2, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 1, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 2, 1, 1, '');",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Chance', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2, 3));\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 1, 0, 10, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 3, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `creature_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 1, 0, 10, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 3, 0, 100, 0, 1, 0, 1, 1, '');",
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('Item', 0);

      page.expectUniqueError();
    });
  });

  it('should correctly show the warning if the loot id is not correctly set in the creature template', () => {
    setup(true, 0);

    expect(page.query('.alert-info').innerText).toContain(
      'You have to set the field `lootid` of creature_template in order to enable this feature.',
    );
  });
});
