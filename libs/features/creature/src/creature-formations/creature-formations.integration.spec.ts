import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureFormation } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
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

  const memberGuid = 99999;

  const originalRow0 = new CreatureFormation();
  const originalRow1 = new CreatureFormation();
  const originalRow2 = new CreatureFormation();
  originalRow0.memberGuid = originalRow1.memberGuid = originalRow2.memberGuid = memberGuid;
  originalRow0.memberGuid = 99999;
  originalRow1.memberGuid = 99998;
  originalRow2.memberGuid = 99997;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        CreatureFormationsComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [CreatureHandlerService, SaiCreatureHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${memberGuid}`;
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
      expect(page.getInputById('leaderGuid').disabled).toBe(true);
      expect(page.getInputById('memberGuid').disabled).toBe(true);
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
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99997, 99998, 99999));\n' +
        'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        '(99999, 99997, 0, 0, 0, 0, 0),\n' +
        '(99999, 99998, 0, 0, 0, 0, 0),\n' +
        '(99999, 99999, 0, 0, 0, 0, 0);';
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
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 0, 0, 0, 0, 0);`,
      );

      // Reset the spy before making further changes
      querySpy.calls.reset();

      // Modify the memberGuid to 99997
      page.setInputValueById('memberGuid', '99997');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99997, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99997));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99997, 0, 0, 0, 0, 0);`,
      );

      // Modify the memberGuid to 99998
      page.setInputValueById('memberGuid', '99998');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99997));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99998, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99998));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99998, 0, 0, 0, 0, 0);`,
      );

      // Modify the memberGuid to 99999
      page.setInputValueById('memberGuid', '99999');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99998));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 0, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 0, 0, 0, 0, 0);`,
      );

      // Modify the distance (dist) to 10
      page.setInputValueById('dist', '10');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 0, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 0, 0, 0, 0);`,
      );

      // Modify the angle to 45
      page.setInputValueById('angle', '45');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 0, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 0, 0, 0);`,
      );

      // Modify the groupAI to 1
      page.setInputValueById('groupAI', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 1, 0, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 1, 0, 0);`,
      );

      // Modify point_1 to 100
      page.setInputValueById('point_1', '100');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 1, 100, 0);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 1, 100, 0);`,
      );

      // Modify point_2 to 200
      page.setInputValueById('point_2', '200');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 1, 100, 200);`,
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          `(99999, 99999, 10, 45, 1, 100, 200);`,
      );

      // Define the final expected query after all modifications
      const finalExpectedQuery =
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99999));\n' +
        'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
        `(99999, 99999, 10, 45, 1, 100, 200);`;

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
        'DELETE FROM `creature_formations` WHERE (`leaderGuid` = 99999) AND (`memberGuid` IN (99997, 99998, 99999));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(123, 1234, 0, 0, 1, 2, 0),\n' +
          '(0, 1234, 0, 0, 1, 2, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(123, 1234, 0, 0, 1, 2, 0),\n' +
          '(0, 1234, 0, 0, 1, 2, 0);',
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
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99997, 0, 0, 0, 0, 0),\n' +
          '(99999, 99998, 0, 0, 0, 0, 0),\n' +
          '(99999, 99999, 0, 0, 0, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`id1` = 1234) AND (`guid` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99998, 0, 0, 0, 0, 0),\n' +
          '(99999, 99999, 0, 0, 0, 0, 0);\n',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE (`id1` = 1234) AND (`guid` IN (1, 2));\n');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99999, 0, 0, 0, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_formations` WHERE `id1` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('map', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('zoneId', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234) AND (`guid` IN (1, 2));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99997, 0, 0, 1, 0, 0),\n' +
          '(99999, 99998, 0, 0, 0, 2, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99997, 0, 0, 0, 0, 0),\n' +
          '(99999, 99998, 0, 0, 1, 0, 0),\n' +
          '(99999, 99999, 0, 0, 0, 2, 0);',
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
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234) AND (`guid` IN (1, 2, 3));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99997, 0, 0, 0, 10, 0),\n' +
          '(99999, 99998, 0, 0, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`)' +
          '(99999, 99997, 0, 0, 0, 0, 0),\n' +
          '(99999, 99998, 0, 0, 0, 10, 0),\n' +
          '(99999, 99999, 0, 0, 0, 0, 0);',
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
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234) AND (`guid` IN (0));\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(99999, 99999, 0, 0, 123, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_formations` WHERE (`id1` = 1234);\n' +
          'INSERT INTO `creature_formations` (`leaderGuid`, `memberGuid`, `dist`, `angle`, `groupAI`, `point_1`, `point_2`) VALUES\n' +
          '(99999, 99997, 0, 0, 123, 0, 0),\n' +
          '(99999, 99998, 0, 0, 0, 0, 0),\n' +
          '(99999, 99999, 0, 0, 0, 0, 0);\n',
      );
    }));
  });
});
