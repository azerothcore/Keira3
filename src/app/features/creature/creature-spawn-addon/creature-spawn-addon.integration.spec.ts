import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureSpawnAddonComponent } from './creature-spawn-addon.component';
import { CreatureSpawnAddonModule } from './creature-spawn-addon.module';
import { QueryService } from '../../../shared/services/query.service';
import { CreatureSpawnAddon } from '../../../shared/types/creature-spawn-addon.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { MultiRowEditorPageObject } from '../../../shared/testing/multi-row-editor-page-object';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

class CreatureSpawnAddonPage extends MultiRowEditorPageObject<CreatureSpawnAddonComponent> {}

describe('CreatureSpawnAddon integration tests', () => {
  let component: CreatureSpawnAddonComponent;
  let fixture: ComponentFixture<CreatureSpawnAddonComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureSpawnAddonPage;

  const id = 1234;

  const originalRow0 = new CreatureSpawnAddon();
  const originalRow1 = new CreatureSpawnAddon();
  const originalRow2 = new CreatureSpawnAddon();
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureSpawnAddonModule,
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

    spyOn(TestBed.get(CreatureSpawnAddonService), 'selectQuery').and.returnValue(of(
      { results: creatingNew ? [] : [originalRow0, originalRow1, originalRow2] }
    ));

    fixture = TestBed.createComponent(CreatureSpawnAddonComponent);
    component = fixture.componentInstance;
    page = new CreatureSpawnAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(true); // because ADD feature is missing
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('guid').disabled).toBe(true);
      expect(page.getInputById('path_id').disabled).toBe(true);
      expect(page.getInputById('mount').disabled).toBe(true);
      expect(page.getInputById('bytes1').disabled).toBe(true);
      expect(page.getInputById('bytes2').disabled).toBe(true);
      expect(page.getInputById('emote').disabled).toBe(true);
      expect(page.getInputById('isLarge').disabled).toBe(true);
      expect(page.getInputById('auras').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    // it('adding new rows and executing the query should correctly work', () => {
    //  // Missing feature: ADD
    // });

    // it('adding a row and changing its values should correctly update the queries', () => {
    //   // Missing feature: ADD
    // });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `creature_addon` WHERE (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(2, 0, 0, 0, 0, 0, 0, \'\');');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0, 2));\n' +
        'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(2, 0, 0, 0, 0, 0, 0, \'\');'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0));\n' +
        'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(0, 0, 0, 0, 0, 0, 0, \'\');');

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0, 1, 2));'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('path_id', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('mount', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (1, 2));\n' +
        'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1, 1, 0, 0, 0, 0, 0, \'\'),\n' +
        '(2, 0, 2, 0, 0, 0, 0, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1, 1, 0, 0, 0, 0, 0, \'\'),\n' +
        '(2, 0, 2, 0, 0, 0, 0, \'\');'
      );
    });

    // it('combining add, edit and delete should correctly work', () => {
    //   // Missing feature: ADD
    // });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('guid', 0);

      page.expectUniqueError();
    });
  });
});

