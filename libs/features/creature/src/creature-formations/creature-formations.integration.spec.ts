import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureFormation } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureFormationsComponent } from './creature-formations.component';
import Spy = jasmine.Spy;

class CreatureFormationPage extends MultiRowEditorPageObject<CreatureFormationsComponent> {}

describe('CreatureFormations integration tests', () => {
  let fixture: ComponentFixture<CreatureFormationsComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureFormationPage;

  const memberGUID = 1234;

  const originalRow0 = new CreatureFormation();
  const originalRow1 = new CreatureFormation();
  const originalRow2 = new CreatureFormation();
  originalRow0.memberGUID = 1234;
  originalRow1.memberGUID = 1235;
  originalRow2.memberGUID = 1236;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureFormationsComponent, // This should typically be in declarations, but as per your instruction, it's left unchanged
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [CreatureHandlerService, SaiCreatureHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${memberGUID}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(CreatureFormationsComponent);
    page = new CreatureFormationPage(fixture);
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
      expect(handlerService.isCreatureFormationUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureFormationUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureFormationUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1234) AND (`memberGUID` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 0, 0, 0, 0, 0),\n' +
        '(1234, 2, 0, 0, 0, 0, 0);';
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
      // Add a new row
      page.addNewRow();

      // Initial DELETE and INSERT queries after adding a new row
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1234) AND (`memberGUID` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1234, 0, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1234, 0, 0, 0, 0, 0, 0);`,
      );

      // Reset the spy before making further changes
      querySpy.calls.reset();

      // Modify the memberGUID to 1235
      page.setInputValueById('leaderGUID', '1235');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1235) AND (`memberGUID` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1235, 0, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1235);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1235, 0, 0, 0, 0, 0, 0);`,
      );

      // Modify the leaderGUID to 1236
      page.setInputValueById('leaderGUID', '1236');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 0, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 0, 0, 0, 0, 0, 0);`,
      );

      // Modify the memberGUID to 1236
      page.setInputValueById('memberGUID', '1236');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 0, 0, 0, 0, 0);`,
      );

      // Modify the distance (dist) to 10
      page.setInputValueById('dist', '10');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 0, 0, 0, 0);`,
      );

      // Modify the angle to 45
      page.setInputValueById('angle', '45');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 0, 0, 0);`,
      );

      // Modify the groupAI to 1
      page.setInputValueById('groupAI', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 1, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 1, 0, 0);`,
      );

      // Modify point_1 to 100
      page.setInputValueById('point_1', '100');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 1, 100, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 1, 100, 0);`,
      );

      // Modify point_2 to 200
      page.setInputValueById('point_2', '200');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 1, 100, 200);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(1236, 1236, 10, 45, 1, 100, 200);`,
      );

      // Define the final expected query after all modifications
      const finalExpectedQuery =
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1236) AND (`memberGUID` IN (1236));\n' +
        'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        `(1236, 1236, 10, 45, 1, 100, 200);`;

      // Reset the spy before executing the final query
      querySpy.calls.reset();

      // Ensure the final query is as expected
      page.expectDiffQueryToContain(finalExpectedQuery);

      // Execute the query
      page.clickExecuteQuery();

      // Verify that the querySpy was called correctly
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(finalExpectedQuery);
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      page.addNewRow();
      page.setInputValueById('point_1', '1');
      page.setInputValueById('point_2', '2');
      page.setInputValueById('angle', '2.2');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1234) AND (`memberGUID` IN (0, 1));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(1234, 0, 0, 2.2, 0, 1, 2),\n' +
          '(1234, 1, 0, 2.2, 0, 1, 2);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(1234, 0, 0, 2.2, 0, 1, 2),\n' +
          '(1234, 1, 0, 2.2, 0, 1, 2);',
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
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1234, 0, 0, 0, 0, 0),\n' +
          '(0, 1235, 0, 0, 0, 0, 0),\n' +
          '(0, 1236, 0, 0, 0, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0) AND (`memberGUID` IN (1235))');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1234, 0, 0, 0, 0, 0),\n' +
          '(0, 1236, 0, 0, 0, 0, 0);\n',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0) AND (`memberGUID` IN (1235, 1236));\n');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1234, 0, 0, 0, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE `leaderGUID` = 0;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('dist', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('angle', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0) AND (`memberGUID` IN (1235, 1236));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1235, 1, 0, 0, 0, 0),\n' +
          '(0, 1236, 0, 2, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1234, 0, 0, 0, 0, 0),\n' +
          '(0, 1235, 1, 0, 0, 0, 0),\n' +
          '(0, 1236, 0, 2, 0, 0, 0);',
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('dist', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0) AND (`memberGUID` IN (1235, 1236, 0));\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1235, 10, 0, 0, 0, 0),\n' +
          '(1234, 0, 0, 0, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGUID` = 0);\n' +
          'INSERT INTO `creature_formations` (`leaderGUID`, `memberGUID`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(0, 1234, 0, 0, 0, 0, 0),\n' +
          '(0, 1235, 10, 0, 0, 0, 0),\n' +
          '(1234, 0, 0, 0, 0, 0, 0);',
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('memberGUID', 1234); // Replaced 0 with 1234

      page.expectUniqueError();
    });
  });
});
