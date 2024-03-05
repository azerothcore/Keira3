import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteQueryService } from '@keira/shared/core';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GameobjectSpawn } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectSpawnComponent } from './gameobject-spawn.component';
import { GameobjectSpawnModule } from './gameobject-spawn.module';
import Spy = jasmine.Spy;

class GameobjectSpawnPage extends MultiRowEditorPageObject<GameobjectSpawnComponent> {}

describe('GameobjectSpawn integration tests', () => {
  let fixture: ComponentFixture<GameobjectSpawnComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectSpawnPage;

  const id = 1234;

  const originalRow0 = new GameobjectSpawn();
  const originalRow1 = new GameobjectSpawn();
  const originalRow2 = new GameobjectSpawn();
  originalRow0.id = originalRow1.id = originalRow2.id = id;
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), GameobjectSpawnModule, RouterTestingModule, TranslateTestingModule],
      providers: [GameobjectHandlerService, SaiGameobjectHandlerService, TranslateTestingModule],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(GameobjectSpawnComponent);
    page = new GameobjectSpawnPage(fixture);
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
      expect(page.getInputById('position_x').disabled).toBe(true);
      expect(page.getInputById('position_y').disabled).toBe(true);
      expect(page.getInputById('position_z').disabled).toBe(true);
      expect(page.getInputById('orientation').disabled).toBe(true);
      expect(page.getInputById('rotation0').disabled).toBe(true);
      expect(page.getInputById('rotation1').disabled).toBe(true);
      expect(page.getInputById('rotation2').disabled).toBe(true);
      expect(page.getInputById('rotation3').disabled).toBe(true);
      expect(page.getInputById('spawntimesecs').disabled).toBe(true);
      expect(page.getInputById('animprogress').disabled).toBe(true);
      expect(page.getInputById('state').disabled).toBe(true);
      expect(page.getInputById('ScriptName').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isGameobjectSpawnUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isGameobjectSpawnUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isGameobjectSpawnUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `gameobject` WHERE (`id` = ' +
        id +
        ') AND (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
        '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
        '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(0, ' +
        id +
        ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
        '(1, ' +
        id +
        ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
        '(2, ' +
        id +
        ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n";

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
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ') AND (`guid` IN (0));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.setInputValueById('map', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ') AND (`guid` IN (0));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.setInputValueById('zoneId', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ') AND (`guid` IN (0));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.setInputValueById('guid', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ') AND (`guid` IN (123));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(123, ' +
          id +
          ", 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(123, ' +
          id +
          ", 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
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
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(1, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(2, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `gameobject` WHERE (`id` = ' + id + ') AND (`guid` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(2, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `gameobject` WHERE (`id` = ' + id + ') AND (`guid` IN (1, 2));\n');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `gameobject` WHERE `id` = ' + id + ';');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('map', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('zoneId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ') AND (`guid` IN (1, 2));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(1, ' +
          id +
          ", 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(2, ' +
          id +
          ", 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(1, ' +
          id +
          ", 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(2, ' +
          id +
          ", 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
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
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ') AND (`guid` IN (1, 2, 3));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(1, ' +
          id +
          ", 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(3, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, ' +
          '`position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, ' +
          '`spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          '(0, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(1, ' +
          id +
          ", 0, 10, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          '(3, ' +
          id +
          ", 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);\n",
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('guid', 0);

      page.expectUniqueError();
    });

    xit('changing a value via AreaSelector should correctly work', waitForAsync(async () => {
      const field = 'areaId';
      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'query').and.returnValue(of([{ m_ID: 123, m_ParentAreaID: 456, m_AreaName_lang: 'Mock Area' }]));

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
        'DELETE FROM `gameobject` WHERE (`id` = 1234) AND (`guid` IN (0));\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, `position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, `spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 123, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject` WHERE (`id` = 1234);\n' +
          'INSERT INTO `gameobject` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, `position_x`, `position_y`, `position_z`, `orientation`, `rotation0`, `rotation1`, `rotation2`, `rotation3`, `spawntimesecs`, `animprogress`, `state`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
          "(0, 1234, 0, 0, 123, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          "(1, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0),\n" +
          "(2, 1234, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);",
      );
    }));
  });
});
