import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { NpcVendorComponent } from './npc-vendor.component';
import { NpcVendorModule } from './npc-vendor.module';
import { QueryService } from '@keira-shared/services/query.service';
import { NpcVendor } from '@keira-types/npc-vendor.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class NpcVendorPage extends MultiRowEditorPageObject<NpcVendorComponent> {}

describe('NpcVendor integration tests', () => {
  let component: NpcVendorComponent;
  let fixture: ComponentFixture<NpcVendorComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: NpcVendorPage;

  const id = 1234;

  const originalRow0 = new NpcVendor();
  const originalRow1 = new NpcVendor();
  const originalRow2 = new NpcVendor();
  originalRow0.entry = originalRow1.entry = originalRow2.entry = id;
  originalRow0.item = 0;
  originalRow1.item = 1;
  originalRow2.item = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NpcVendorModule,
        RouterTestingModule,
      ],
      providers: [
        CreatureHandlerService,
        SaiCreatureHandlerService,
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

    fixture = TestBed.createComponent(NpcVendorComponent);
    component = fixture.componentInstance;
    page = new NpcVendorPage(fixture);
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
      expect(page.getInputById('slot').disabled).toBe(true);
      expect(page.getInputById('item').disabled).toBe(true);
      expect(page.getInputById('maxcount').disabled).toBe(true);
      expect(page.getInputById('incrtime').disabled).toBe(true);
      expect(page.getInputById('ExtendedCost').disabled).toBe(true);
      expect(page.getSelectorBtn('item').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (0, 1, 2));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 0, 1, 0, 0, 0, 0),\n' +
        '(1234, 0, 2, 0, 0, 0, 0);';
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
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (0));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0);'
      );

      page.setInputValueById('slot', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (0));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 0, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 0, 0, 0, 0);'
      );

      page.setInputValueById('maxcount', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (0));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 2, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 2, 0, 0, 0);'
      );

      page.setInputValueById('item', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (123));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 123, 2, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 123, 2, 0, 0, 0);'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 0, 1, 0, 0, 0, 0),\n' +
        '(1234, 0, 2, 0, 0, 0, 0);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 0, 2, 0, 0, 0, 0);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE `entry` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('slot', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('maxcount', '2');

      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (1, 2));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0, 0, 0, 0),\n' +
        '(1234, 0, 2, 2, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 1, 0, 0, 0, 0),\n' +
        '(1234, 0, 2, 2, 0, 0, 0);'
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('maxcount', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (1, 2, 3));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 1, 10, 0, 0, 0),\n' +
        '(1234, 0, 3, 0, 0, 0, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 0, 1, 10, 0, 0, 0),\n' +
        '(1234, 0, 3, 0, 0, 0, 0);'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('item', 0);

      page.expectUniqueError();
    });
  });
});

