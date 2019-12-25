import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { SaiEditorComponent } from './sai-editor.component';
import { SaiEditorModule } from './sai-editor.module';
import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';
import { MultiRowEditorPageObject } from '../../../../test-utils/multi-row-editor-page-object';
import { SAI_TYPES, SmartScripts } from '../../../../types/smart-scripts.type';
import { QueryService } from '../../../../services/query.service';

class SaiEditorPage extends MultiRowEditorPageObject<SaiEditorComponent> {}

fdescribe('SaiEditorComponent Integration', () => {
  let component: SaiEditorComponent;
  let fixture: ComponentFixture<SaiEditorComponent>;
  let handlerService: SaiHandlerService;
  let queryService: QueryService;
  let querySpy: Spy;
  let page: SaiEditorPage;

  const sourceType = SAI_TYPES.SAI_TYPE_CREATURE;
  const id = 1234;

  const originalRow0 = new SmartScripts();
  const originalRow1 = new SmartScripts();
  const originalRow2 = new SmartScripts();
  originalRow0.source_type = originalRow1.source_type = originalRow2.source_type = sourceType;
  originalRow0.entryorguid = originalRow1.entryorguid = originalRow2.entryorguid = id;
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SaiEditorModule,
        RouterTestingModule,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const selected = { source_type: sourceType, entryorguid: id };
    handlerService = TestBed.get(SaiHandlerService);
    handlerService['_selected'] = JSON.stringify(selected);
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalRow0, originalRow1, originalRow2] }
    ));

    fixture = TestBed.createComponent(SaiEditorComponent);
    component = fixture.componentInstance;
    page = new SaiEditorPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    fit('should correctly initialise', () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('link').disabled).toBe(true);
      expect(page.getInputById('event_type').disabled).toBe(true);
      expect(page.getInputById('event_phase_mask').disabled).toBe(true);
      expect(page.getInputById('event_chance').disabled).toBe(true);
      expect(page.getInputById('event_flags').disabled).toBe(true);
      expect(page.getInputById('event_param1').disabled).toBe(true);
      expect(page.getInputById('event_param2').disabled).toBe(true);
      expect(page.getInputById('event_param3').disabled).toBe(true);
      expect(page.getInputById('event_param4').disabled).toBe(true);
      expect(page.getInputById('event_param5').disabled).toBe(true);
      expect(page.getInputById('action_type').disabled).toBe(true);
      expect(page.getInputById('action_param1').disabled).toBe(true);
      expect(page.getInputById('action_param2').disabled).toBe(true);
      expect(page.getInputById('action_param3').disabled).toBe(true);
      expect(page.getInputById('action_param4').disabled).toBe(true);
      expect(page.getInputById('action_param5').disabled).toBe(true);
      expect(page.getInputById('action_param6').disabled).toBe(true);
      expect(page.getInputById('target_type').disabled).toBe(true);
      expect(page.getInputById('target_param1').disabled).toBe(true);
      expect(page.getInputById('target_param2').disabled).toBe(true);
      expect(page.getInputById('target_param3').disabled).toBe(true);
      expect(page.getInputById('target_param4').disabled).toBe(true);
      expect(page.getInputById('target_x').disabled).toBe(true);
      expect(page.getInputById('target_y').disabled).toBe(true);
      expect(page.getInputById('target_z').disabled).toBe(true);
      expect(page.getInputById('target_o').disabled).toBe(true);
      expect(page.getInputById('comment').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    xit('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(1, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(2, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);';
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

    xit('adding a row and changing its values should correctly update the queries', () => {
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (0));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );

      page.setInputValueById('map', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (0));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );

      page.setInputValueById('zoneId', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (0));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );

      page.setInputValueById('guid', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (123));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(123, 1234, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(123, 1234, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    xit('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(1, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(2, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    xit('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(2, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);\n'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (1, 2));\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE `id` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    xit('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('map', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('zoneId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (1, 2));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(1, 1234, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(2, 1234, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(1, 1234, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(2, 1234, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
    });

    xit('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('zoneId', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234) AND (`guid` IN (1, 2, 3));\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(1, 1234, 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(3, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id` = 1234);\n' +
        'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`modelid`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`spawndist`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(1, 1234, 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0),\n' +
        '(3, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, \'\', 0);');
    });

    xit('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('guid', 0);

      page.expectUniqueError();
    });
  });
});
