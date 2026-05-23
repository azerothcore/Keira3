import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GameobjectQuestitem } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectQuestitemComponent } from './gameobject-questitem.component';
import { instance, mock } from 'ts-mockito';

class GameobjectQuestitemPage extends MultiRowEditorPageObject<GameobjectQuestitemComponent> {}

describe('GameobjectQuestitem integration tests', () => {
  const id = 1234;

  const originalRow0 = new GameobjectQuestitem();
  const originalRow1 = new GameobjectQuestitem();
  const originalRow2 = new GameobjectQuestitem();
  originalRow0.GameObjectEntry = originalRow1.GameObjectEntry = originalRow2.GameObjectEntry = id;
  originalRow0.Idx = 0;
  originalRow1.Idx = 1;
  originalRow2.Idx = 2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), GameobjectQuestitemComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(GameobjectQuestitemComponent);
    const page = new GameobjectQuestitemPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { fixture, queryService, querySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('Idx').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      expect(handlerService.isGameobjectQuestitemUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isGameobjectQuestitemUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isGameobjectQuestitemUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 0, 0),\n' +
        '(1234, 2, 0, 0);';
      querySpy.mockClear();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (0));\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0);',
      );

      page.setInputValueById('Idx', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1));\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );

      page.setInputValueById('ItemId', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1));\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 123, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 123, 0);',
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('Idx', '1');
      page.setInputValueById('ItemId', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1, 0));\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 123, 0),\n' +
          '(1234, 0, 123, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 123, 0),\n' +
          '(1234, 0, 123, 0);',
      );
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 1, 0, 0),\n' +
          '(1234, 2, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 2, 0, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `gameobject_questitem` WHERE `GameObjectEntry` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('ItemId', 1);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1));\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 1, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 1, 1, 0),\n' +
          '(1234, 2, 0, 0);',
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      const { fixture, page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('ItemId', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      fixture.detectChanges();

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234) AND (`Idx` IN (1, 2, 3));\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 10, 0),\n' +
          '(1234, 3, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questitem` WHERE (`GameObjectEntry` = 1234);\n' +
          'INSERT INTO `gameobject_questitem` (`GameObjectEntry`, `Idx`, `ItemId`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 1, 10, 0),\n' +
          '(1234, 3, 0, 0);',
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('Idx', 0);

      page.expectUniqueError();
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);
      await page.whenReady();

      const written = await page.changeAllFieldsAsync(originalRow0, ['VerifiedBuild', 'GameObjectEntry', 'Idx']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('ItemId', 1);

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });

    it('changing a value via ItemSelector should correctly work', async () => {
      const { page, queryService } = setup(false);
      vi.spyOn(queryService, 'query').mockReturnValue(of([{ entry: 1234, name: 'Mock Item' }]));

      page.clickRowOfDatatable(0);
      await page.whenReady();

      const result = await page.openSelectorAndPickRow('ItemId', 0, { clickSearch: true });

      expect(result).toBe('1234');
      page.expectDiffQueryToContain('`ItemId`');
    });
  });
});
