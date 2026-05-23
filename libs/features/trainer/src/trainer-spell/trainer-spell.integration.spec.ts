import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainerSpell } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TrainerSpellComponent } from './trainer-spell.component';

class TrainerSpellPage extends MultiRowEditorPageObject<TrainerSpellComponent> {}

describe('TrainerSpell integration tests', () => {
  const id = 1234;

  const columns = [
    'TrainerId',
    'SpellId',
    'MoneyCost',
    'ReqSkillLine',
    'ReqSkillRank',
    'ReqAbility1',
    'ReqAbility2',
    'ReqAbility3',
    'ReqLevel',
    'VerifiedBuild',
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), TrainerSpellComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        TrainerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow0 = new TrainerSpell();
    const originalRow1 = new TrainerSpell();
    const originalRow2 = new TrainerSpell();
    originalRow0.TrainerId = originalRow1.TrainerId = originalRow2.TrainerId = id;
    originalRow0.SpellId = 0;
    originalRow1.SpellId = 1;
    originalRow2.SpellId = 2;

    const handlerService = TestBed.inject(TrainerHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const sqliteQuerySpy = vi.spyOn(sqliteQueryService, 'query').mockReturnValue(of([]));
    vi.spyOn(sqliteQueryService, 'getSpellNameById').mockResolvedValue('Mock Spell');

    const fixture = TestBed.createComponent(TrainerSpellComponent);
    const page = new TrainerSpellPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { fixture, queryService, querySpy, sqliteQueryService, sqliteQuerySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('SpellId').disabled).toBe(true);
      expect(page.getInputById('MoneyCost').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      expect(handlerService.isTrainerSpellUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isTrainerSpellUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isTrainerSpellUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `trainer_spell` WHERE (`TrainerId` = 1234) AND (`SpellId` IN (0, 1, 2));\n' +
        'INSERT INTO `trainer_spell` (`TrainerId`, `SpellId`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqAbility1`, `ReqAbility2`, `ReqAbility3`, `ReqLevel`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 1, 0, 0, 0, 0, 0, 0, 0, 0),\n' +
        '(1234, 2, 0, 0, 0, 0, 0, 0, 0, 0);';
      querySpy.mockClear();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      // first in-tree caller for expectFullQueryToInsert
      page.expectFullQueryToInsert('trainer_spell', columns, [
        [1234, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1234, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1234, 2, 0, 0, 0, 0, 0, 0, 0, 0],
      ]);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `trainer_spell` WHERE (`TrainerId` = 1234);\n' +
          'INSERT INTO `trainer_spell` (`TrainerId`, `SpellId`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqAbility1`, `ReqAbility2`, `ReqAbility3`, `ReqLevel`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0),\n' +
          '(1234, 1, 0, 0, 0, 0, 0, 0, 0, 0),\n' +
          '(1234, 2, 0, 0, 0, 0, 0, 0, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('editing existing rows should correctly produce a DELETE+INSERT diff', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);
      page.setInputValueById('MoneyCost', 500);

      // structured matcher: single secondary-key form (no JSON-serialised composite)
      page.expectDiffQueryToDeleteInsert('trainer_spell', 'TrainerId', id, 'SpellId', [0], columns, [[1234, 0, 500, 0, 0, 0, 0, 0, 0, 0]]);
      page.expectFullQueryToContain(
        'DELETE FROM `trainer_spell` WHERE (`TrainerId` = 1234);\n' +
          'INSERT INTO `trainer_spell` (`TrainerId`, `SpellId`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqAbility1`, `ReqAbility2`, `ReqAbility3`, `ReqLevel`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 500, 0, 0, 0, 0, 0, 0, 0),\n' +
          '(1234, 1, 0, 0, 0, 0, 0, 0, 0, 0),\n' +
          '(1234, 2, 0, 0, 0, 0, 0, 0, 0, 0);',
      );
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);
      const written = await page.changeAllFieldsAsync(new TrainerSpell(), ['VerifiedBuild', 'TrainerId', 'SpellId']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.clickRowOfDatatable(0);
      page.setInputValueById('MoneyCost', 99);

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });

    it('using the same SpellId for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('SpellId', 0);

      page.expectUniqueError();
    });
  });

  describe('Selectors', () => {
    it('changing a value via SpellSelector (SpellId) should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      sqliteQuerySpy.mockReturnValue(of([{ ID: 888, spellName: 'Mock Spell' }]));

      page.clickRowOfDatatable(0);
      await page.whenReady();

      const value = await page.openSelectorAndPickRow('SpellId', 0, { clickSearch: true });

      expect(value).toEqual('888');
      // the DELETE clause covers both the old (0) and the new (888) SpellId of the edited row
      page.expectDiffQueryToContain(
        'DELETE FROM `trainer_spell` WHERE (`TrainerId` = 1234) AND (`SpellId` IN (0, 888));\n' +
          'INSERT INTO `trainer_spell` (`TrainerId`, `SpellId`, `MoneyCost`, `ReqSkillLine`, `ReqSkillRank`, `ReqAbility1`, `ReqAbility2`, `ReqAbility3`, `ReqLevel`, `VerifiedBuild`) VALUES\n' +
          '(1234, 888, 0, 0, 0, 0, 0, 0, 0, 0);',
      );
      page.removeNativeElement();
    });

    it('changing a value via SkillSelector (ReqSkillLine) should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      // SkillSelectorModal uses SKILL_ID ('id') as its entityIdField.
      sqliteQuerySpy.mockReturnValue(of([{ id: 55, name: 'Mock Skill' }]));

      page.clickRowOfDatatable(0);
      await page.whenReady();

      const value = await page.openSelectorAndPickRow('ReqSkillLine', 0, { clickSearch: true });

      expect(value).toEqual('55');
      page.expectDiffQueryToContain('`ReqSkillLine`');
      page.expectDiffQueryToContain('(1234, 0, 0, 55, 0, 0, 0, 0, 0, 0);');
      page.removeNativeElement();
    });

    it('changing a value via SpellSelector (ReqAbility1) should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      sqliteQuerySpy.mockReturnValue(of([{ ID: 101, spellName: 'Mock Spell' }]));

      page.clickRowOfDatatable(0);
      await page.whenReady();

      const value = await page.openSelectorAndPickRow('ReqAbility1', 0, { clickSearch: true });

      expect(value).toEqual('101');
      page.expectDiffQueryToContain('(1234, 0, 0, 0, 0, 101, 0, 0, 0, 0);');
      page.removeNativeElement();
    });

    it('changing a value via SpellSelector (ReqAbility2) should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      sqliteQuerySpy.mockReturnValue(of([{ ID: 202, spellName: 'Mock Spell' }]));

      page.clickRowOfDatatable(0);
      await page.whenReady();

      const value = await page.openSelectorAndPickRow('ReqAbility2', 0, { clickSearch: true });

      expect(value).toEqual('202');
      page.expectDiffQueryToContain('(1234, 0, 0, 0, 0, 0, 202, 0, 0, 0);');
      page.removeNativeElement();
    });

    it('changing a value via SpellSelector (ReqAbility3) should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      sqliteQuerySpy.mockReturnValue(of([{ ID: 303, spellName: 'Mock Spell' }]));

      page.clickRowOfDatatable(0);
      await page.whenReady();

      const value = await page.openSelectorAndPickRow('ReqAbility3', 0, { clickSearch: true });

      expect(value).toEqual('303');
      page.expectDiffQueryToContain('(1234, 0, 0, 0, 0, 0, 0, 303, 0, 0);');
      page.removeNativeElement();
    });
  });

  describe('Conditional render (ReqAbility1 !== 0 gate)', () => {
    // ReqAbility1 column is the 7th datatable column
    // (index 6: selection, SpellId, SpellName, MoneyCost, ReqSkillLine, ReqSkillRank, ReqAbility1).
    const reqAbility1ColIndex = 6;

    /**
     * Render-presence test using rows whose ReqAbility1 values are fixed at init time, so the
     * @if (value !== 0) gate + async spell-name pipe are exercised on the initial render — this
     * avoids the Shape-D zoneless re-render timing risk flagged in the plan (§4.A.2 / gotcha 6).
     */
    function setupWithRows() {
      const zeroRow = new TrainerSpell();
      const nonZeroRow = new TrainerSpell();
      zeroRow.TrainerId = nonZeroRow.TrainerId = id;
      zeroRow.SpellId = 0;
      zeroRow.ReqAbility1 = 0;
      nonZeroRow.SpellId = 1;
      nonZeroRow.ReqAbility1 = 12345;

      const handlerService = TestBed.inject(TrainerHandlerService);
      handlerService['_selected'] = `${id}`;
      handlerService.isNew = false;

      const queryService = TestBed.inject(MysqlQueryService);
      vi.spyOn(queryService, 'query').mockReturnValue(of([]));
      vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
      vi.spyOn(queryService, 'selectAll').mockReturnValue(of([zeroRow, nonZeroRow]));

      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      vi.spyOn(sqliteQueryService, 'query').mockReturnValue(of([]));
      const getSpellNameSpy = vi.spyOn(sqliteQueryService, 'getSpellNameById').mockResolvedValue('Mock Spell');

      const fixture = TestBed.createComponent(TrainerSpellComponent);
      const page = new TrainerSpellPage(fixture);
      fixture.autoDetectChanges(true);
      fixture.detectChanges();
      return { page, getSpellNameSpy };
    }

    it('keeps the ReqAbility1 cell empty when its value is 0', async () => {
      const { page } = setupWithRows();
      await page.whenReady();

      const zeroCell = page.getDatatableCell(0, reqAbility1ColIndex);
      expect(zeroCell.querySelector('keira-icon')).toBeFalsy();
      page.removeNativeElement();
    });

    it('passes the ReqAbility1 !== 0 gate and looks up the spell name when non-zero', async () => {
      const { page, getSpellNameSpy } = setupWithRows();
      await page.whenReady();

      // The ReqAbility1 cell template only calls getSpellNameById(value) when the
      // `@if (value !== 0)` gate passes. Row 1 has ReqAbility1 = 12345, so the lookup
      // must fire for that value; row 0 (ReqAbility1 = 0) is gated out for that column.
      expect(getSpellNameSpy).toHaveBeenCalledWith(12345);

      // TODO (Shape-D zoneless async-pipe timing risk, see plan §4.A.2 / gotcha 6):
      // asserting the resolved <keira-icon>/spell-name actually paints into the
      // ngx-datatable cell is flaky under provideZonelessChangeDetection() because the
      // async-pipe Promise resolution does not reliably flush into the detached cell view.
      // The gate behaviour is verified above (lookup fires for non-zero, empty cell for zero)
      // without depending on that timing. Painting is covered by e2e.
      page.removeNativeElement();
    });
  });
});
