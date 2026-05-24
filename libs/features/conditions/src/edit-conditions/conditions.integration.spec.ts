import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CONDITIONS_TABLE, Conditions } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { ConditionsComponent } from './conditions.component';

class ConditionsPage extends EditorPageObject<ConditionsComponent> {
  getQuestStateFlagSelector(assert = true) {
    return this.query(`#queststate-flag-selector`, assert);
  }
  getRankMaskFlagSelector(assert = true) {
    return this.query(`#rankmask-flag-selector`, assert);
  }
}

describe('Conditions integration tests', () => {
  const sourceTypeOrReferenceId = 1;
  const sourceGroup = 2;
  const sourceEntry = 3;

  const id = {
    ConditionTarget: 0,
    ConditionTypeOrReference: 0,
    ConditionValue1: 0,
    ConditionValue2: 0,
    ConditionValue3: 0,
    ElseGroup: 0,
    SourceEntry: sourceEntry,
    SourceGroup: sourceGroup,
    SourceId: 0,
    SourceTypeOrReferenceId: sourceTypeOrReferenceId,
  };

  const expectedFullCreateQuery =
    'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' +
    sourceTypeOrReferenceId +
    ') AND (`SourceGroup` = ' +
    sourceGroup +
    ') AND (`SourceEntry` = ' +
    sourceEntry +
    ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
    'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
    "(1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '');";

  const originalEntity = new Conditions();
  originalEntity.SourceTypeOrReferenceId = sourceTypeOrReferenceId;
  originalEntity.SourceGroup = sourceGroup;
  originalEntity.SourceEntry = sourceEntry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), ConditionsComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        ConditionsHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => undefined);
    const handlerService = TestBed.inject(ConditionsHandlerService);
    handlerService['_selected'] = JSON.stringify(id);
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    vi.spyOn(queryService, 'selectAllMultipleKeys').mockReturnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(ConditionsComponent);
    const page = new ConditionsPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, querySpy, handlerService };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'ElseGroup';
      expect(handlerService.isConditionsUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isConditionsUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isConditionsUnsaved()).toBe(false);
    });

    it('changing a property and executing the query should correctly work', async () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = 2) AND (`SourceGroup` = 3) AND ' +
        '(`SourceEntry` = ' +
        sourceEntry +
        ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
        'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
        "(2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '');";

      // After save, the editor reloads the (now-existing) entity via its new composite key;
      // make the reload return the persisted row so the post-save reload succeeds.
      const savedEntity = new Conditions();
      savedEntity.SourceTypeOrReferenceId = 2;
      savedEntity.SourceGroup = 3;
      savedEntity.SourceEntry = sourceEntry;
      vi.spyOn(TestBed.inject(MysqlQueryService), 'selectAllMultipleKeys').mockReturnValue(of([savedEntity]));

      querySpy.mockClear();

      page.setSelectValueById('SourceTypeOrReferenceId', 2);
      await page.whenReady();
      page.setInputValueById('SourceGroup', 3);
      await page.whenReady();
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      await page.whenReady();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('should correctly toggle flag selector according to the selected condition type', () => {
      const { page } = setup(true);
      expect(page.getQuestStateFlagSelector(false)).toBeFalsy();
      expect(page.getRankMaskFlagSelector(false)).toBeFalsy();

      page.setSelectValueById('ConditionTypeOrReference', 5); // CONDITION_REPUTATION_RANK
      expect(page.getQuestStateFlagSelector(false)).toBeFalsy();
      expect(page.getRankMaskFlagSelector).toBeTruthy();

      page.setSelectValueById('ConditionTypeOrReference', 47); // CONDITION_QUESTSTATE
      expect(page.getQuestStateFlagSelector).toBeTruthy();
      expect(page.getRankMaskFlagSelector(false)).toBeFalsy();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery =
        'UPDATE `conditions` SET `SourceTypeOrReferenceId` = 0, `SourceGroup` = 1, `SourceEntry` = 2, `SourceId` = 3, `ElseGroup` = 4, `ConditionTypeOrReference` = 5, ' +
        "`ConditionTarget` = 6, `ConditionValue1` = 7, `ConditionValue2` = 8, `ConditionValue3` = 9, `NegativeCondition` = 10, `ErrorType` = 11, `ErrorTextId` = 12, `ScriptName` = '13', " +
        "`Comment` = '14' WHERE (`SourceTypeOrReferenceId` = 1) AND (`SourceGroup` = 2) AND (`SourceEntry` = 3) AND (`SourceId` = 0) AND (`ElseGroup` = 0) " +
        'AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)';
      querySpy.mockClear();

      page.changeAllFields(originalEntity, []);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('SourceGroup', '1');
      page.expectDiffQueryToContain(
        'UPDATE `conditions` SET `SourceGroup` = 1 WHERE (`SourceTypeOrReferenceId` = ' +
          sourceTypeOrReferenceId +
          ') AND (`SourceGroup` = ' +
          sourceGroup +
          ') AND (`SourceEntry` = ' +
          sourceEntry +
          ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)',
      );
      // Additional structured-matcher assertion (alongside the exact-string check above).
      page.expectDiffQueryToUpdate(
        CONDITIONS_TABLE,
        {
          SourceTypeOrReferenceId: sourceTypeOrReferenceId,
          SourceGroup: sourceGroup,
          SourceEntry: sourceEntry,
          SourceId: 0,
          ElseGroup: 0,
          ConditionTypeOrReference: 0,
          ConditionTarget: 0,
          ConditionValue1: 0,
          ConditionValue2: 0,
          ConditionValue3: 0,
        },
        { SourceGroup: 1 },
      );
      page.expectFullQueryToContain(
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' +
          sourceTypeOrReferenceId +
          ') AND (`SourceGroup` = ' +
          sourceGroup +
          ') AND (`SourceEntry` = ' +
          sourceEntry +
          ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
          'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
          "(1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '');",
      );

      page.setInputValueById('SourceEntry', '4');
      page.expectDiffQueryToContain(
        'UPDATE `conditions` SET `SourceGroup` = 1, `SourceEntry` = 4 WHERE (`SourceTypeOrReferenceId` = ' +
          sourceTypeOrReferenceId +
          ') AND (`SourceGroup` = ' +
          sourceGroup +
          ') AND (`SourceEntry` = ' +
          sourceEntry +
          ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' +
          sourceTypeOrReferenceId +
          ') AND (`SourceGroup` = ' +
          sourceGroup +
          ') AND (`SourceEntry` = ' +
          sourceEntry +
          ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
          'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
          "(1, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '');",
      );
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page, querySpy } = setup(false);
      // Conditions has no computed/disabled fields, so the excluded list is empty.
      const written = await page.changeAllFieldsAsync(originalEntity, []);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain(`\`${field}\` =`);
      }

      querySpy.mockClear();
      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
    });

    it('shows an error toast when the save query fails', async () => {
      const { page, querySpy } = setup(false);
      page.setInputValueById('SourceGroup', '99'); // make the form dirty

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });
  });

  describe('Selectors', () => {
    // NOTE: the selector-button DOM id is derived from the FlagsSelectorBtn `config.name`
    // (-> `ConditionValue1`/`ConditionValue2`), not from the explicit host `id` attribute
    // (`queststate-flag-selector` / `rankmask-flag-selector`). Because the @if arms are
    // mutually exclusive on ConditionTypeOrReference, only one button renders at a time,
    // so `ConditionValue2-selector-btn` resolves uniquely once the type is set.
    it('TYPEMASK flags selector writes a bitmask to ConditionValue1', async () => {
      const { page } = setup(false);
      page.setSelectValueById('ConditionTypeOrReference', 32); // CONDITION_TYPE_MASK -> showTypeMask
      await page.whenReady();

      // TYPEMASK display rows 0 and 2 map to bits 3 (8) and 5 (32) -> 40
      const value = await page.openFlagsAndToggle('ConditionValue1', [0, 2]);

      expect(value).toBe(40);
      page.expectDiffQueryToContain('`ConditionValue1` = 40');
    });

    it('QUEST_STATE flags selector writes to ConditionValue2', async () => {
      const { page } = setup(false);
      page.setSelectValueById('ConditionTypeOrReference', 47); // CONDITION_QUESTSTATE -> showQuestState
      await page.whenReady();

      // QUEST_STATE display row 1 maps to bit 1 -> value 2
      const value = await page.openFlagsAndToggle('ConditionValue2', [1]);

      expect(value).toBe(2);
      page.expectDiffQueryToContain('`ConditionValue2` = 2');
    });

    it('RANKMASK flags selector writes to ConditionValue2', async () => {
      const { page } = setup(false);
      page.setSelectValueById('ConditionTypeOrReference', 5); // CONDITION_REPUTATION_RANK -> showReactionTo
      await page.whenReady();

      // RANKMASK display row 1 maps to bit 1 -> value 2
      const value = await page.openFlagsAndToggle('ConditionValue2', [1]);

      expect(value).toBe(2);
      page.expectDiffQueryToContain('`ConditionValue2` = 2');
    });

    it('OBJECT_ENTRY_GUID single-value selector writes to ConditionValue1', async () => {
      const { page } = setup(false);
      page.setSelectValueById('ConditionTypeOrReference', 31); // CONDITION_OBJECT_ENTRY_GUID -> showObjectEntryGuid
      await page.whenReady();

      // CONDITION_OBJECT_ENTRY_GUID_CV1 row 0 -> value 3
      const value = await page.openSelectorAndPickRow('ConditionValue1', 0);

      expect(value).not.toBe('0');
      page.expectDiffQueryToContain(`\`ConditionValue1\` = ${value}`);
    });

    it('LEVEL single-value selector writes to ConditionValue2', async () => {
      const { page } = setup(false);
      page.setSelectValueById('ConditionTypeOrReference', 27); // CONDITION_LEVEL -> showLevel
      await page.whenReady();

      // CONDITION_LEVEL_CV2 row 1 -> value 1 (row 0 is value 0 and would not produce a diff)
      const value = await page.openSelectorAndPickRow('ConditionValue2', 1);

      expect(value).not.toBe('0');
      page.expectDiffQueryToContain(`\`ConditionValue2\` = ${value}`);
    });

    it('INSTANCE_INFO single-value selector writes to ConditionValue3', async () => {
      const { page } = setup(false);
      page.setSelectValueById('ConditionTypeOrReference', 13); // CONDITION_INSTANCE_INFO -> showInstanceInfo
      await page.whenReady();

      // CONDITION_INSTANCE_INFO_CV3 row 1 -> value 1 (row 0 is value 0 and would not produce a diff)
      const value = await page.openSelectorAndPickRow('ConditionValue3', 1);

      expect(value).not.toBe('0');
      page.expectDiffQueryToContain(`\`ConditionValue3\` = ${value}`);
    });
  });
});
