import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/core';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/test-utils';
import { GameobjectSpawnAddon } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectSpawnAddonComponent } from './gameobject-spawn-addon.component';
import { GameobjectSpawnAddonModule } from './gameobject-spawn-addon.module';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';

class GameobjectSpawnAddonPage extends MultiRowEditorPageObject<GameobjectSpawnAddonComponent> {}

describe('GameobjectSpawnAddon integration tests', () => {
  const id = 1234;

  const originalRow0 = new GameobjectSpawnAddon();
  const originalRow1 = new GameobjectSpawnAddon();
  const originalRow2 = new GameobjectSpawnAddon();
  originalRow0.guid = 0;
  originalRow1.guid = 1;
  originalRow2.guid = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), GameobjectSpawnAddonModule, RouterTestingModule, TranslateTestingModule],
      providers: [GameobjectHandlerService, SaiGameobjectHandlerService],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(TestBed.inject(GameobjectSpawnAddonService), 'selectQuery').and.returnValue(
      of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]),
    );

    const fixture = TestBed.createComponent(GameobjectSpawnAddonComponent);
    const component = fixture.componentInstance;
    const page = new GameobjectSpawnAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { component, fixture, queryService, querySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { handlerService, page } = setup(true);
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
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 1, 2));\n' +
          'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
          '(0, 0, 0),\n' +
          '(1, 0, 0),\n' +
          '(2, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_addon` WHERE (`guid` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 2));\n' +
          'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
          '(0, 0, 0),\n' +
          '(2, 0, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_addon` WHERE (`guid` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0));\n' +
          'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
          '(0, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 1, 2));');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('invisibilityType', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('invisibilityValue', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (1, 2));\n' +
          'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
          '(1, 1, 0),\n' +
          '(2, 0, 2);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_addon` WHERE (`guid` IN (0, 1, 2));\n' +
          'INSERT INTO `gameobject_addon` (`guid`, `invisibilityType`, `invisibilityValue`) VALUES\n' +
          '(0, 0, 0),\n' +
          '(1, 1, 0),\n' +
          '(2, 0, 2);',
      );
    });

    // it('combining add, edit and delete should correctly work', () => {
    //   // Missing feature: ADD
    // });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('guid', 0);

      page.expectUniqueError();
    });
  });
});
