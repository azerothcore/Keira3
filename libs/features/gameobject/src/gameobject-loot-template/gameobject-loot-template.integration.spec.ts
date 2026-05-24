import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GameobjectLootTemplate } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { instance, mock } from 'ts-mockito';

class GameobjectLootTemplatePage extends MultiRowEditorPageObject<GameobjectLootTemplateComponent> {}

describe('GameobjectLootTemplate integration tests', () => {
  const id = 1234; // Data1
  const _type = 3; // could be 3 or 25

  const originalRow0 = new GameobjectLootTemplate();
  const originalRow1 = new GameobjectLootTemplate();
  const originalRow2 = new GameobjectLootTemplate();
  originalRow0.Entry = originalRow1.Entry = originalRow2.Entry = id;
  originalRow0.Item = 0;
  originalRow1.Item = 1;
  originalRow2.Item = 2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        GameobjectLootTemplateComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean, lootId = id, type = _type) {
    vi.spyOn(TestBed.inject(GameobjectLootTemplateService), 'getLootId').mockReturnValue(of([{ lootId }]));

    vi.spyOn(TestBed.inject(GameobjectLootTemplateService), 'getType').mockReturnValue(of([{ type }]));

    const handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(GameobjectLootTemplateComponent);
    const page = new GameobjectLootTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { fixture, queryService, querySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
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
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      expect(handlerService.isGameobjectLooTemplateUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isGameobjectLooTemplateUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isGameobjectLooTemplateUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
        '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
        "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
        "(1234, 1, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
        "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');";
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
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('Chance', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 0, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('QuestRequired', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('Item', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123));\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, '');",
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('Chance', '1');
      page.setInputValueById('QuestRequired', '2');
      page.setInputValueById('Item', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123, 0));\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, ''),\n" +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, ''),\n" +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        '' +
          'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 1, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_loot_template` WHERE `Entry` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('LootMode', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (2));\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 2, 0, 100, 0, 1, 2, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 1, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 2, 1, 1, '');",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
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
          "(1234, 1, 0, 10, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 3, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `gameobject_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 1, 0, 10, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 3, 0, 100, 0, 1, 0, 1, 1, '');",
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('Item', 0);

      page.expectUniqueError();
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);
      await page.whenReady();

      const written = await page.changeAllFieldsAsync(originalRow0, ['Entry', 'Item']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('Chance', 10);

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });
  });

  it('should correctly show the warning if the loot id and type field are not correctly set in the gameobject template', () => {
    const { page } = setup(true, 0);

    expect(page.query('.alert-info').innerText).toContain(
      'You have to set the field `Data1` (lootid) and `type` (3 or 25) of gameobject_template in order to enable this feature.',
    );
  });

  it('should show the warning when type is not 3 or 25', () => {
    const { page } = setup(true, id, 5);

    expect(page.query('.alert-info').innerText).toContain(
      'You have to set the field `Data1` (lootid) and `type` (3 or 25) of gameobject_template in order to enable this feature.',
    );
  });

  it('should render the loot-editor when lootId > 0 and type is 3 or 25', () => {
    const { page } = setup(false, id, 3);

    expect(page.query('keira-loot-editor', false)).toBeTruthy('Expected keira-loot-editor to render when gated on');
    expect(page.query('.alert-info', false)).toBeFalsy('Expected the gating alert to be hidden');
  });
});
