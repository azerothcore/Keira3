import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateComponent } from './reference-loot-template.component';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

class ReferenceLootTemplatePage extends MultiRowEditorPageObject<ReferenceLootTemplateComponent> {}

describe('ReferenceLootTemplate integration tests', () => {
  const id = 1234;

  const originalRow0 = new ReferenceLootTemplate();
  const originalRow1 = new ReferenceLootTemplate();
  const originalRow2 = new ReferenceLootTemplate();
  originalRow0.Entry = originalRow1.Entry = originalRow2.Entry = id;
  originalRow0.Item = 0;
  originalRow1.Item = 1;
  originalRow2.Item = 2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), ReferenceLootTemplateComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        ReferenceLootHandlerService,
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(ReferenceLootHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'getItemNameById').mockReturnValue(of('MockItemName').toPromise() as Promise<string>);

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(ReferenceLootTemplateComponent);
    const page = new ReferenceLootTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, querySpy, handlerService };
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
      const { page, handlerService } = setup(true);
      expect(handlerService.isUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0, 1, 2));\n' +
        'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
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

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(true);
      page.addNewRow();
      await page.whenReady();

      // Entry is the primary key — excluded; every other LootTemplate field is editable.
      const written = await page.changeAllFieldsAsync(new ReferenceLootTemplate(), ['Entry']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('Chance', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 0, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('QuestRequired', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (0));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );

      page.setInputValueById('Item', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
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
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (123, 0));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
          '`GroupId`, `MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 123, 0, 1, 2, 1, 0, 1, 1, ''),\n" +
          "(1234, 0, 0, 1, 2, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
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
          'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, ' +
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
      page.expectDiffQueryToContain('DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 2, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 0, 0, 100, 0, 1, 0, 1, 1, '');",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `reference_loot_template` WHERE `Entry` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('LootMode', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('GroupId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (2));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 2, 0, 100, 0, 1, 2, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
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
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234) AND (`Item` IN (1, 2, 3));\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
          '`MinCount`, `MaxCount`, `Comment`) VALUES\n' +
          "(1234, 1, 0, 10, 0, 1, 0, 1, 1, ''),\n" +
          "(1234, 3, 0, 100, 0, 1, 0, 1, 1, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `reference_loot_template` WHERE (`Entry` = 1234);\n' +
          'INSERT INTO `reference_loot_template` (`Entry`, `Item`, `Reference`, `Chance`, `QuestRequired`, `LootMode`, `GroupId`, ' +
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

    it('shows an error toast when the save query fails', async () => {
      const { page, querySpy } = setup(false);
      page.clickRowOfDatatable(0);
      page.setInputValueById('Chance', '5');

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });

    it('opening the Item selector and picking a row populates Item', async () => {
      const { page, querySpy } = setup(false);
      page.clickRowOfDatatable(0);
      await page.whenReady();

      querySpy.mockReturnValue(of([{ entry: 999, name: 'Mock Item' }]));

      const value = await page.openSelectorAndPickRow('Item', 0, { clickSearch: true });

      expect(value).toBe('999');
      page.expectDiffQueryToContain('`Item`');
      page.removeNativeElement();
    });

    it('opening the LootMode flags selector and toggling bits updates LootMode', async () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);
      await page.whenReady();

      // LootMode default is 1 (bit 0); toggling bit 1 (value 2) ORs in 2 -> 3.
      const value = await page.openFlagsAndToggle('LootMode', [1]);

      expect(value).toBe(3);
      page.expectDiffQueryToContain('`LootMode`');
      page.removeNativeElement();
    });

    describe('Item icon and selector button visibility based on Reference field', () => {
      it('should display keira-item-selector-btn when Reference is 0', () => {
        const { page } = setup(false);
        page.clickRowOfDatatable(0);
        page.detectChanges();

        expect(page.query('keira-item-selector-btn', false)).toBeTruthy();
        expect(page.queryAll('keira-icon').length).toBeGreaterThan(0);
      });

      it('should hide keira-item-selector-btn when Reference is not 0', () => {
        const { page } = setup(false);
        page.addNewRow();
        page.setInputValueById('Reference', '5');
        page.detectChanges();

        expect(page.query('keira-item-selector-btn', false)).toBeFalsy();
      });

      it('should hide the per-row icon when Reference changes from 0 to non-zero', () => {
        const { page } = setup(false);
        page.clickRowOfDatatable(0);
        page.detectChanges();

        const initialIconCount = page.queryAll('keira-icon').length;
        expect(initialIconCount).toBeGreaterThan(0);

        page.setInputValueById('Reference', '10');
        page.detectChanges();

        expect(page.queryAll('keira-icon').length).toBeLessThan(initialIconCount);
      });
    });
  });
});
