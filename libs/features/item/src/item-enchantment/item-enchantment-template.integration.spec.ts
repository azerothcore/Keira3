import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ItemEnchantmentTemplate } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplateComponent } from './item-enchantment-template.component';
import Spy = jasmine.Spy;

class ItemEnchantmentTemplatePage extends MultiRowEditorPageObject<ItemEnchantmentTemplateComponent> {}

describe('ItemEnchantmentTemplate integration tests', () => {
  let fixture: ComponentFixture<ItemEnchantmentTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: ItemHandlerService;
  let page: ItemEnchantmentTemplatePage;

  const id = 1234;

  const originalRow0 = new ItemEnchantmentTemplate();
  const originalRow1 = new ItemEnchantmentTemplate();
  const originalRow2 = new ItemEnchantmentTemplate();
  originalRow0.entry = originalRow1.entry = originalRow2.entry = id;
  originalRow0.ench = 0;
  originalRow1.ench = 1;
  originalRow2.ench = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        ItemEnchantmentTemplateComponent,
        RouterTestingModule,
        ModalModule.forRoot(),
        TranslateTestingModule,
      ],
      providers: [ItemHandlerService],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(ItemHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(ItemEnchantmentTemplateComponent);
    page = new ItemEnchantmentTemplatePage(fixture);
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
      expect(page.getInputById('chance').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isItemEnchantmentUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isItemEnchantmentUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isItemEnchantmentUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (0, 1, 2));\n' +
        'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
        '(1234, 0, 0),\n' +
        '(1234, 1, 0),\n' +
        '(1234, 2, 0);';
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
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (0));\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0);',
      );

      page.setInputValueById('chance', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (0));\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 1);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 1);',
      );

      page.setInputValueById('ench', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (123));\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 123, 1);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 123, 1);',
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      page.addNewRow();
      page.setInputValueById('chance', '11');
      page.setInputValueById('ench', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (123, 0));\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 123, 11),\n' +
          '(1234, 0, 11);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 123, 11),\n' +
          '(1234, 0, 11);',
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
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0),\n' +
          '(1234, 1, 0),\n' +
          '(1234, 2, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0),\n' +
          '(1234, 2, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `item_enchantment_template` WHERE `entry` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('chance', 1);

      page.expectDiffQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (1));\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 1, 1);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0),\n' +
          '(1234, 1, 1),\n' +
          '(1234, 2, 0);',
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('chance', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234) AND (`ench` IN (1, 2, 3));\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 1, 10),\n' +
          '(1234, 3, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `item_enchantment_template` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `item_enchantment_template` (`entry`, `ench`, `chance`) VALUES\n' +
          '(1234, 0, 0),\n' +
          '(1234, 1, 10),\n' +
          '(1234, 3, 0);',
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('ench', 0);

      page.expectUniqueError();
    });
  });
});
