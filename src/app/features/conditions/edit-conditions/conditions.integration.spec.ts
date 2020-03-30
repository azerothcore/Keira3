import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { ConditionsComponent } from './conditions.component';
import { ConditionsEditorModule } from './conditions-editor.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { Conditions } from '@keira-types/conditions.type';
import { ConditionsHandlerService } from '../conditions-handler.service';

class ConditionsPage extends EditorPageObject<ConditionsComponent> {}

describe('Conditions integration tests', () => {
  let component: ConditionsComponent;
  let fixture: ComponentFixture<ConditionsComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: ConditionsHandlerService;
  let page: ConditionsPage;
  let navigateSpy: Spy;

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ConditionsEditorModule,
        RouterTestingModule,
      ],
      providers: [
        ConditionsHandlerService,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    handlerService = TestBed.inject(ConditionsHandlerService);
    handlerService['_selected'] = JSON.stringify(id);
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));

    fixture = TestBed.createComponent(ConditionsComponent);
    component = fixture.componentInstance;
    page = new ConditionsPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('should correctly update the unsaved status', () => {
      const field = 'ElseGroup';
      expect(handlerService.isConditionsUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isConditionsUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isConditionsUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = 2) AND (`SourceGroup` = 3) AND ' +
      '(`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
      'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
      '(2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');';
      querySpy.calls.reset();

      page.setSelectValueById('SourceTypeOrReferenceId', 2);
      page.setInputValueById('SourceGroup', 3);
      page.clickExecuteQuery();

      page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

  });


  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `conditions` SET `SourceTypeOrReferenceId` = \'\', `SourceGroup` = 1, `SourceEntry` = 2, `SourceId` = 3, `ElseGroup` = 4, `ConditionTypeOrReference` = \'\', '
      + '`ConditionTarget` = 6, `ConditionValue1` = 7, `ConditionValue2` = 8, `ConditionValue3` = 9, `NegativeCondition` = 10, `ErrorType` = 11, `ErrorTextId` = 12, `ScriptName` = \'13\', '
      + '`Comment` = \'14\' WHERE (`SourceTypeOrReferenceId` = 1) AND (`SourceGroup` = 2) AND (`SourceEntry` = 3) AND (`SourceId` = 0) AND (`ElseGroup` = 0) '
      + 'AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, []);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {

      page.setInputValueById('SourceGroup', '1');
      page.expectDiffQueryToContain(
        'UPDATE `conditions` SET `SourceGroup` = 1 WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
        'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
        '(1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');'
      );

      page.setInputValueById('SourceEntry', '4');
      page.expectDiffQueryToContain(
        'UPDATE `conditions` SET `SourceGroup` = 1, `SourceEntry` = 4 WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0)'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 0) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
        'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
        '(1, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\');'
      );
    });

  });

});

