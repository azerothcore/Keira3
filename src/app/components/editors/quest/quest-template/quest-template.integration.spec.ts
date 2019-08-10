import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QuestTemplateComponent } from './quest-template.component';
import { QuestTemplateModule } from './quest-template.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { QuestTemplate } from '../../../../types/quest-template.type';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';

class QuestTemplatePage extends EditorPageObject<QuestTemplateComponent> {}

describe('QuestTemplate integration tests', () => {
  let component: QuestTemplateComponent;
  let fixture: ComponentFixture<QuestTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: QuestHandlerService;
  let page: QuestTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `quest_template` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_template` (`ID`, `QuestType`, `QuestLevel`, `MinLevel`, `QuestSortID`, `QuestInfoID`, ' +
    '`SuggestedGroupNum`, `RequiredFactionId1`, `RequiredFactionId2`, `RequiredFactionValue1`, `RequiredFactionValue2`, ' +
    '`RewardNextQuest`, `RewardXPDifficulty`, `RewardMoney`, `RewardBonusMoney`, `RewardDisplaySpell`, `RewardSpell`,' +
    ' `RewardHonor`, `RewardKillHonor`, `StartItem`, `Flags`, `RequiredPlayerKills`, `RewardItem1`, `RewardAmount1`, ' +
    '`RewardItem2`, `RewardAmount2`, `RewardItem3`, `RewardAmount3`, `RewardItem4`, `RewardAmount4`, `ItemDrop1`, ' +
    '`ItemDropQuantity1`, `ItemDrop2`, `ItemDropQuantity2`, `ItemDrop3`, `ItemDropQuantity3`, `ItemDrop4`, ' +
    '`ItemDropQuantity4`, `RewardChoiceItemID1`, `RewardChoiceItemQuantity1`, `RewardChoiceItemID2`, ' +
    '`RewardChoiceItemQuantity2`, `RewardChoiceItemID3`, `RewardChoiceItemQuantity3`, `RewardChoiceItemID4`, ' +
    '`RewardChoiceItemQuantity4`, `RewardChoiceItemID5`, `RewardChoiceItemQuantity5`, `RewardChoiceItemID6`, ' +
    '`RewardChoiceItemQuantity6`, `POIContinent`, `POIx`, `POIy`, `POIPriority`, `RewardTitle`, `RewardTalents`, ' +
    '`RewardArenaPoints`, `RewardFactionID1`, `RewardFactionValue1`, `RewardFactionOverride1`, `RewardFactionID2`, ' +
    '`RewardFactionValue2`, `RewardFactionOverride2`, `RewardFactionID3`, `RewardFactionValue3`, `RewardFactionOverride3`, ' +
    '`RewardFactionID4`, `RewardFactionValue4`, `RewardFactionOverride4`, `RewardFactionID5`, `RewardFactionValue5`, ' +
    '`RewardFactionOverride5`, `TimeAllowed`, `AllowableRaces`, `LogTitle`, `LogDescription`, `QuestDescription`, ' +
    '`AreaDescription`, `QuestCompletionLog`, `RequiredNpcOrGo1`, `RequiredNpcOrGo2`, `RequiredNpcOrGo3`, `RequiredNpcOrGo4`, ' +
    '`RequiredNpcOrGoCount1`, `RequiredNpcOrGoCount2`, `RequiredNpcOrGoCount3`, `RequiredNpcOrGoCount4`, `RequiredItemId1`, ' +
    '`RequiredItemId2`, `RequiredItemId3`, `RequiredItemId4`, `RequiredItemId5`, `RequiredItemId6`, `RequiredItemCount1`, ' +
    '`RequiredItemCount2`, `RequiredItemCount3`, `RequiredItemCount4`, `RequiredItemCount5`, `RequiredItemCount6`, `Unknown0`, ' +
    '`ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' +
    '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', \'\', ' +
    '\'\', \'\', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', \'\', \'\', 0);\n';

  const originalEntity = new QuestTemplate();
  originalEntity.ID = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        QuestTemplateModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(QuestTemplateComponent);
    component = fixture.componentInstance;
    page = new QuestTemplatePage(fixture);
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

    it('changing a property and executing the query should correctly work', () => {
      querySpy.calls.reset();

      page.setInputValueById('LogTitle', 'Shin');
      page.clickExecuteQuery();

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('Shin');
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain('Shin');
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `quest_template` SET `MinLevel` = 2 WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.setInputValueById('MinLevel', 2);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('LogTitle', 'Shin');
      page.expectDiffQueryToContain(
        'UPDATE `quest_template` SET `LogTitle` = \'Shin\' WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain('Shin');

      page.setInputValueById('MinLevel', 22);
      page.expectDiffQueryToContain(
        'UPDATE `quest_template` SET `MinLevel` = 22, `LogTitle` = \'Shin\' WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain('Shin');
      page.expectFullQueryToContain('22');
    });

    it('changing a value via FlagsSelector should correctly work', () => {
      const field = 'Flags';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.toggleFlagInRow(2);
      page.toggleFlagInRow(12);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('4100');
      page.expectDiffQueryToContain(
        'UPDATE `quest_template` SET `Flags` = 4100 WHERE (`ID` = 1234);'
      );

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('4100');
    });
  });
});

