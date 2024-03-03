import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/core';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/test-utils';
import { CreatureSpawnAddon } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureSpawnAddonComponent } from './creature-spawn-addon.component';
import { CreatureSpawnAddonModule } from './creature-spawn-addon.module';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

class CreatureSpawnAddonPage extends MultiRowEditorPageObject<CreatureSpawnAddonComponent> {}

describe('CreatureSpawnAddon integration tests', () => {
  let fixture: ComponentFixture<CreatureSpawnAddonComponent>;
  let queryService: MysqlQueryService;
  let handlerService: CreatureHandlerService;
  let page: CreatureSpawnAddonPage;

  const id = 1234;

  const originalRow0 = new CreatureSpawnAddon();
  const originalRow1 = new CreatureSpawnAddon();
  const originalRow2 = new CreatureSpawnAddon();
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureSpawnAddonModule, RouterTestingModule, TranslateTestingModule],
      providers: [CreatureHandlerService, SaiCreatureHandlerService],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(TestBed.inject(CreatureSpawnAddonService), 'selectQuery').and.returnValue(
      of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]),
    );

    fixture = TestBed.createComponent(CreatureSpawnAddonComponent);
    // component = fixture.componentInstance;
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
      expect(page.getInputById('visibilityDistanceType').disabled).toBe(true);
      expect(page.getInputById('auras').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
      expect(handlerService.isCreatureSpawnAddonUnsaved).toBe(false);
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
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0, 1, 2));\n' +
          'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `visibilityDistanceType`, `auras`) VALUES\n' +
          "(0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(2, 0, 0, 0, 0, 0, 0, '');",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_addon` WHERE (`guid` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0, 2));\n' +
          'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `visibilityDistanceType`, `auras`) VALUES\n' +
          "(0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(2, 0, 0, 0, 0, 0, 0, '');",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_addon` WHERE (`guid` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0));\n' +
          'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `visibilityDistanceType`, `auras`) VALUES\n' +
          "(0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_addon` WHERE (`guid` IN (0, 1, 2));');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('path_id', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('mount', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (1, 2));\n' +
          'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `visibilityDistanceType`, `auras`) VALUES\n' +
          "(1, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(2, 0, 2, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_addon` WHERE (`guid` IN (0, 1, 2));\n' +
          'INSERT INTO `creature_addon` (`guid`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `visibilityDistanceType`, `auras`) VALUES\n' +
          "(0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1, 1, 0, 0, 0, 0, 0, ''),\n" +
          "(2, 0, 2, 0, 0, 0, 0, '');",
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
