import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ConditionsComponent } from './conditions.component';
import { ConditionsEditorModule } from './conditions-editor.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { highlightOptions } from '@keira-config/highlight.config';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { Conditions } from '@keira-types/conditions.type';
import { ConditionsHandlerService } from '../conditions-handler.service';

class ConditionsPage extends EditorPageObject<ConditionsComponent> {
  getQuestStateFlagSelector(assert = true) { return this.query(`#queststate-flag-selector`, assert); }
  getRankMaskFlagSelector(assert = true) { return this.query(`#rankmask-flag-selector`, assert); }
}

xdescribe('Conditions integration tests', () => {

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
    SourceTypeOrReferenceId: sourceTypeOrReferenceId
  };

  const expectedFullCreateQuery = 'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
    'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
    '(1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');';

  const originalEntity = new Conditions();
  originalEntity.SourceTypeOrReferenceId = sourceTypeOrReferenceId;
  originalEntity.SourceGroup = sourceGroup;
  originalEntity.SourceEntry = sourceEntry;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ConditionsEditorModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: HIGHLIGHT_OPTIONS, useValue: highlightOptions },
        ConditionsHandlerService,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    spyOn(TestBed.inject(Router), 'navigate');
    const handlerService = TestBed.inject(ConditionsHandlerService);
    handlerService['_selected'] = JSON.stringify(id);
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));

    const fixture = TestBed.createComponent(ConditionsComponent);
    const page = new ConditionsPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return {
      handlerService,
      querySpy,
      page,
    };
  }

  describe('Creating new', () => {

    it('should correctly initialise', fakeAsync(waitForAsync(async () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      tick(500);
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'ElseGroup';
      expect(handlerService.isConditionsUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isConditionsUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isConditionsUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', waitForAsync(async () => {
      const { page, querySpy } = setup(true);
      const expectedQuery = 'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = 2) AND (`SourceGroup` = 3) AND ' +
      '(`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
      'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
      '(2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');';
      querySpy.calls.reset();

      page.setSelectValueById('SourceTypeOrReferenceId', 2);
      page.setInputValueById('SourceGroup', 3);
      page.clickExecuteQuery();

      await page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));

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

    it('should correctly initialise', waitForAsync(async () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('changing all properties and executing the query should correctly work', waitForAsync(async () => {
      const { page, querySpy } = setup(false);
      const expectedQuery = 'UPDATE `conditions` SET `SourceTypeOrReferenceId` = \'\', `SourceGroup` = 1, `SourceEntry` = 2, `SourceId` = 3, `ElseGroup` = 4, `ConditionTypeOrReference` = \'\', '
      + '`ConditionTarget` = 6, `ConditionValue1` = 7, `ConditionValue2` = 8, `ConditionValue3` = 9, `NegativeCondition` = 10, `ErrorType` = 11, `ErrorTextId` = 12, `ScriptName` = \'13\', '
      + '`Comment` = \'14\' WHERE (`SourceTypeOrReferenceId` = 1) AND (`SourceGroup` = 2) AND (`SourceEntry` = 3) AND (`SourceId` = 0) AND (`ElseGroup` = 0) '
      + 'AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, []);
      page.clickExecuteQuery();

      await page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));

    it('changing values should correctly update the queries', waitForAsync(async () => {
      const { page } = setup(false);

      page.setInputValueById('SourceGroup', '1');
      await page.expectDiffQueryToContain(
        'UPDATE `conditions` SET `SourceGroup` = 1 WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
        'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
        '(1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');'
      );

      page.setInputValueById('SourceEntry', '4');
      await page.expectDiffQueryToContain(
        'UPDATE `conditions` SET `SourceGroup` = 1, `SourceEntry` = 4 WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
        'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
        '(1, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');'
      );
    }));

  });

});

