import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CreatureFormation } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureFormationsComponent } from './creature-formations.component';
import { CreatureFormationsService } from './creature-formations.service';

class CreatureFormationPage extends MultiRowEditorPageObject<CreatureFormationsComponent> {}

describe('CreatureFormations integration tests', () => {
  const id = 11043;
  const leaderGUID = 52141;

  const originalRow0 = new CreatureFormation();
  const originalRow1 = new CreatureFormation();
  const originalRow2 = new CreatureFormation();
  originalRow0.leaderGUID = leaderGUID;
  originalRow1.leaderGUID = leaderGUID;
  originalRow2.leaderGUID = leaderGUID;
  originalRow0.memberGUID = leaderGUID;
  originalRow1.memberGUID = 54169;
  originalRow2.memberGUID = 54225;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, CreatureFormationsComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    const selectQuerySpy = vi
      .spyOn(TestBed.inject(CreatureFormationsService), 'selectQuery')
      .mockReturnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(CreatureFormationsComponent);
    const page = new CreatureFormationPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { fixture, queryService, querySpy, selectQuerySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('leaderGUID').disabled).toBe(true);
      expect(page.getInputById('memberGUID').disabled).toBe(true);
      expect(page.getInputById('dist').disabled).toBe(true);
      expect(page.getInputById('angle').disabled).toBe(true);
      expect(page.getInputById('groupAI').disabled).toBe(true);
      expect(page.getInputById('point_1').disabled).toBe(true);
      expect(page.getInputById('point_2').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      expect(handlerService.isCreatureFormationUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureFormationUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureFormationUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        '(0, 0, 0, 0, 0, 0, 0),\n' +
        '(0, 1, 0, 0, 0, 0, 0),\n' +
        '(0, 2, 0, 0, 0, 0, 0);';
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
      const { querySpy, page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 0, 0, 0, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 0, 0, 0, 0, 0, 0);',
      );
      querySpy.mockClear();

      page.setInputValueById('leaderGUID', '1236');
      page.setInputValueById('memberGUID', '1236');
      page.setInputValueById('dist', '10');
      page.setInputValueById('angle', '45');
      page.setInputValueById('groupAI', '1');
      page.setInputValueById('point_1', '100');
      page.setInputValueById('point_2', '200');

      const expectedQuery =
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (1236));\n' +
        'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        '(1236, 1236, 10, 45, 1, 100, 200);';
      page.expectDiffQueryToContain(expectedQuery);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('point_1', '1');
      page.setInputValueById('point_2', '2');
      page.setInputValueById('angle', '2.2');
      page.duplicateSelectedRow();

      const expectedQuery =
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (0, 1));\n' +
        'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        '(0, 0, 0, 2.2, 0, 1, 2),\n' +
        '(0, 1, 0, 2.2, 0, 1, 2);';
      page.expectDiffQueryToContain(expectedQuery);
      page.expectFullQueryToContain(expectedQuery);
    });
  });

  describe('Editing existing', () => {
    it('should load the formations of the spawns of the selected creature', () => {
      const { selectQuerySpy, page } = setup(false);
      expect(selectQuerySpy).toHaveBeenCalledWith(`${id}`);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (52141, 54169, 54225));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 52141, 0, 0, 0, 0, 0),\n' +
          '(52141, 54169, 0, 0, 0, 0, 0),\n' +
          '(52141, 54225, 0, 0, 0, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`memberGUID` IN (54169));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (52141, 54225));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 52141, 0, 0, 0, 0, 0),\n' +
          '(52141, 54225, 0, 0, 0, 0, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`memberGUID` IN (54169, 54225));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (52141));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 52141, 0, 0, 0, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`memberGUID` IN (52141, 54169, 54225));');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('dist', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('angle', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (54169, 54225));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 54169, 1, 0, 0, 0, 0),\n' +
          '(52141, 54225, 0, 2, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (52141, 54169, 54225));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 52141, 0, 0, 0, 0, 0),\n' +
          '(52141, 54169, 1, 0, 0, 0, 0),\n' +
          '(52141, 54225, 0, 2, 0, 0, 0);',
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);
      page.setInputValueById('leaderGUID', leaderGUID);
      page.setInputValueById('memberGUID', 54232);

      page.clickRowOfDatatable(1);
      page.setInputValueById('dist', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (54169, 54225, 54232));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 54169, 10, 0, 0, 0, 0),\n' +
          '(52141, 54232, 0, 0, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`memberGUID` IN (52141, 54169, 54232));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(52141, 52141, 0, 0, 0, 0, 0),\n' +
          '(52141, 54169, 10, 0, 0, 0, 0),\n' +
          '(52141, 54232, 0, 0, 0, 0, 0);',
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('memberGUID', leaderGUID);

      page.expectUniqueError();
    });
  });
});
