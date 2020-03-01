import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateModule } from './gameobject-loot-template.module';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { GameobjectLootTemplate } from '@keira-types/gameobject-loot-template.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

class GameobjectLootTemplatePage extends MultiRowEditorPageObject<GameobjectLootTemplateComponent> {}

describe('GameobjectLootTemplate integration tests', () => {
  let component: GameobjectLootTemplateComponent;
  let fixture: ComponentFixture<GameobjectLootTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectLootTemplatePage;

  const id = 1234; // Data1
  const _type = 3; // could be 3 or 25

  const originalRow0 = new GameobjectLootTemplate();
  const originalRow1 = new GameobjectLootTemplate();
  const originalRow2 = new GameobjectLootTemplate();
  originalRow0.Entry = originalRow1.Entry = originalRow2.Entry = id;
  originalRow0.Item = 0;
  originalRow1.Item = 1;
  originalRow2.Item = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectLootTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean, lootId = id, type = _type)  {
    spyOn(TestBed.inject(GameobjectLootTemplateService), 'getLootId').and.returnValue(of(
      { results: [{ lootId }] }
    ));

    spyOn(TestBed.inject(GameobjectLootTemplateService), 'getType').and.returnValue(of(
      { results: [{ type }] }
    ));

    handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalRow0, originalRow1, originalRow2] }
    ));

    fixture = TestBed.createComponent(GameobjectLootTemplateComponent);
    component = fixture.componentInstance;
    page = new GameobjectLootTemplatePage(fixture);
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

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
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

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('Chance', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 0, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 0, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('QuestRequired', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );

      page.setInputValueById('Item', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 1, 0, 1, 1, \'\');'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('' +
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
        '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE `Entry` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('LootMode', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (2));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 2, 0, 100, 0, 1, 2, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 2, 0, 100, 0, 1, 2, 1, 1, \'\');'
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
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2, 3));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 1, 0, 10, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 3, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        '(1234, 0, 0, 100, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 1, 0, 10, 0, 1, 0, 1, 1, \'\'),\n' +
        '(1234, 3, 0, 100, 0, 1, 0, 1, 1, \'\');'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('Item', 0);

      page.expectUniqueError();
    });
  });

  it('should correctly show the warning if the loot id and type field are not correctly set in the gameobject template', () => {
    setup(true, 0);

    expect(page.query('.alert-info').innerText).toContain(
      'You have to set the field `Data1` (lootid) and `type` (3 or 25) of gameobject_template in order to enable this feature.'
    );
  });
});
