import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { ConditionsComponent } from './conditions.component';
import { ConditionsEditorModule } from './conditions-editor.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { Conditions } from '../../../../types/conditions.type';
import { ConditionsHandlerService } from '../../../../services/handlers/conditions-handler.service';

class ConditionsPage extends EditorPageObject<ConditionsComponent> {}

fdescribe('Conditions integration tests', () => {
  let component: ConditionsComponent;
  let fixture: ComponentFixture<ConditionsComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: ConditionsHandlerService;
  let page: ConditionsPage;

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

  const expectedFullCreateQuery = 'DELETE FROM `conditions` WHERE (`SourceTypeOrReferenceId` = ' + sourceTypeOrReferenceId + ') AND (`SourceGroup` = ' + sourceGroup + ') AND (`SourceEntry` = ' + sourceEntry + ') AND (`SourceId` = 0) AND (`ElseGroup` = 0) AND (`ConditionTypeOrReference` = 6) AND (`ConditionTarget` = 0) AND (`ConditionValue1` = 0) AND (`ConditionValue2` = 0) AND (`ConditionValue3` = 0);\n' +
    'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, `ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
    '(1, 2, 3, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, \'\', NULL)';

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
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(ConditionsHandlerService);
    handlerService['_selected'] = JSON.stringify(id);
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
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

    // fit('changing a property and executing the query should correctly work', () => {
    //   const expectedQuery = 'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
    //     'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
    //     '(1234, 1, 0, 2, 0, 0);';
    //   querySpy.calls.reset();

    //   page.setInputValueById('SourceTypeOrReferenceId', '1: 1');
    //   page.setInputValueById('SourceGroup', 1);
    //   page.clickExecuteQuery();

    //   page.expectFullQueryToContain(expectedQuery);
    //   expect(querySpy).toHaveBeenCalledTimes(1);
    //   expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    // });

  });

});

