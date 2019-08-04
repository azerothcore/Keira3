import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { NpcVendorComponent } from './npc-vendor.component';
import { NpcVendorModule } from './npc-vendor.module';
import { QueryService } from '../../../../services/query.service';
import { NpcVendor } from '../../../../types/npc-vendor.type';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { MultiRowEditorPageObject } from '../../../../test-utils/multi-row-editor-page-object';

class NpcVendorPage extends MultiRowEditorPageObject<NpcVendorComponent> {}

describe('NpcVendor integration tests', () => {
  let component: NpcVendorComponent;
  let fixture: ComponentFixture<NpcVendorComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: NpcVendorPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `npc_vendor` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0),\n' +
    '(1234, 0, 1, 0, 0, 0, 0),\n' +
    '(1234, 0, 2, 0, 0, 0, 0);';

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
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInput('slot').disabled).toBe(true);
      expect(page.getInput('item').disabled).toBe(true);
      expect(page.getInput('maxcount').disabled).toBe(true);
      expect(page.getInput('incrtime').disabled).toBe(true);
      expect(page.getInput('ExtendedCost').disabled).toBe(true);
      expect(page.getSelectorBtn('item').disabled).toBe(true);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `npc_vendor` WHERE (`entry` = 1234) AND (`item` IN (0, 1, 2));\n' +
        'INSERT INTO `npc_vendor` (`entry`, `slot`, `item`, `maxcount`, `incrtime`, `ExtendedCost`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 0, 1, 0, 0, 0, 0),\n' +
        '(1234, 0, 2, 0, 0, 0, 0);';
      querySpy.calls.reset();

      page.clickElement(page.addNewRowBtn);
      page.clickElement(page.addNewRowBtn);
      page.clickElement(page.addNewRowBtn);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      page.clickElement(page.addNewRowBtn);
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

      page.setInputValue(page.getInput('slot'), '1');
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

      page.setInputValue(page.getInput('maxcount'), '2');
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

      page.setInputValue(page.getInput('item'), '123');
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
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });
  });
});

