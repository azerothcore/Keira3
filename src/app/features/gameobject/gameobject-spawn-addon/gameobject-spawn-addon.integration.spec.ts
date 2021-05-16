import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GameobjectSpawnAddonComponent } from './gameobject-spawn-addon.component';
import { GameobjectSpawnAddonModule } from './gameobject-spawn-addon.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GameobjectSpawnAddon } from '@keira-types/gameobject-spawn-addon.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

class GameobjectSpawnAddonPage extends MultiRowEditorPageObject<GameobjectSpawnAddonComponent> {}

describe('GameobjectSpawnAddon integration tests', () => {
  let component: GameobjectSpawnAddonComponent;
  let fixture: ComponentFixture<GameobjectSpawnAddonComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectSpawnAddonPage;

  const id = 1234;

  const originalRow0 = new GameobjectSpawnAddon();
  const originalRow1 = new GameobjectSpawnAddon();
  const originalRow2 = new GameobjectSpawnAddon();
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectSpawnAddonModule,
        RouterTestingModule,
      ],
      providers: [
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(TestBed.inject(GameobjectSpawnAddonService), 'selectQuery').and.returnValue(of(
      creatingNew ? [] : [originalRow0, originalRow1, originalRow2]
    ));

    fixture = TestBed.createComponent(GameobjectSpawnAddonComponent);
    component = fixture.componentInstance;
    page = new GameobjectSpawnAddonPage(fixture);
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
      expect(page.getInputById('invisibilityType').disabled).toBe(true);
      expect(page.getInputById('invisibilityValue').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
      expect(handlerService.isGameobjectSpawnAddonUnsaved).toBe(false);
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
      page.expectFullQueryToContain('DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
        '(0, 0, 0),\n' +
        '(1, 0, 0),\n' +
        '(2, 0, 0);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 2));\n' +
        'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
        '(0, 0, 0),\n' +
        '(2, 0, 0);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0));\n' +
        'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
        '(0, 0, 0);');

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 1, 2));'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('invisibilityType', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('invisibilityValue', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (1, 2));\n' +
        'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
        '(1, 1, 0),\n' +
        '(2, 0, 2);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
        '(0, 0, 0),\n' +
        '(1, 1, 0),\n' +
        '(2, 0, 2);'
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

