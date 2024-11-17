import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureSpawn } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureSpawnComponent } from './creature-spawn.component';
import Spy = jasmine.Spy;

class CreatureSpawnPage extends MultiRowEditorPageObject<CreatureSpawnComponent> {}

describe('CreatureSpawn integration tests', () => {
  let fixture: ComponentFixture<CreatureSpawnComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureSpawnPage;

  const id1 = 1234;

  const originalRow0 = new CreatureSpawn();
  const originalRow1 = new CreatureSpawn();
  const originalRow2 = new CreatureSpawn();
  originalRow0.id1 = originalRow1.id1 = originalRow2.id1 = id1;
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureSpawnComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [CreatureHandlerService, SaiCreatureHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id1}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(CreatureSpawnComponent);
    page = new CreatureSpawnPage(fixture);
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
      expect(page.getInputById('guid').disabled).toBe(true);
      expect(page.getInputById('map').disabled).toBe(true);
      expect(page.getInputById('zoneId').disabled).toBe(true);
      expect(page.getInputById('areaId').disabled).toBe(true);
      expect(page.getInputById('spawnMask').disabled).toBe(true);
      expect(page.getInputById('phaseMask').disabled).toBe(true);
      expect(page.getInputById('equipment_id').disabled).toBe(true);
      expect(page.getInputById('position_x').disabled).toBe(true);
      expect(page.getInputById('position_y').disabled).toBe(true);
      expect(page.getInputById('position_z').disabled).toBe(true);
      expect(page.getInputById('orientation').disabled).toBe(true);
      expect(page.getInputById('spawntimesecs').disabled).toBe(true);
      expect(page.getInputById('wander_distance').disabled).toBe(true);
      expect(page.getInputById('currentwaypoint').disabled).toBe(true);
      expect(page.getInputById('curhealth').disabled).toBe(true);
      expect(page.getInputById('curmana').disabled).toBe(true);
      expect(page.getDebugElementByCss('#MovementType select').nativeElement.disabled).toBe(true);
      expect(page.getInputById('npcflag').disabled).toBe(true);
      expect(page.getInputById('unit_flags').disabled).toBe(true);
      expect(page.getInputById('dynamicflags').disabled).toBe(true);
      expect(page.getInputById('ScriptName').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isCreatureSpawnUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureSpawnUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureSpawnUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
        '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
        '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
        "(1, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
        "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);";
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
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (0));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.setInputValueById('map', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (0));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.setInputValueById('zoneId', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (0));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.setInputValueById('guid', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (123));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      page.addNewRow();
      page.setInputValueById('map', '1');
      page.setInputValueById('zoneId', '2');
      page.setInputValueById('guid', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (123, 0));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(0, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(123, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(0, 1234, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
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
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (1, 2));\n');
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature` WHERE `id1` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('map', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('zoneId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (1, 2));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(1, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('zoneId', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (1, 2, 3));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(1, 1234, 0, 0, 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(3, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, ' +
          '`wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, ' +
          '`dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(3, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('guid', 0);

      page.expectUniqueError();
    });

    xit('changing a value via MapSelector should correctly work', waitForAsync(async () => {
      const field = 'map';
      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'query').and.returnValue(of([{ m_ID: 123, m_MapName_lang1: 'Mock Map' }]));

      // because this is a multi-row editor
      page.clickRowOfDatatable(0);
      await page.whenReady();

      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickSearchBtn();
      await fixture.whenStable();
      page.clickRowOfDatatableInModal(0);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234) AND (`guid` IN (0));\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, `wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, `dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 123, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature` (`guid`, `id1`, `id2`, `id3`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, `equipment_id`, `position_x`, `position_y`, `position_z`, `orientation`, `spawntimesecs`, `wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, `unit_flags`, `dynamicflags`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 123, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 120, 0, 0, 1, 0, 0, 0, 0, 0, '', 0);\n",
      );
    }));
  });
});
