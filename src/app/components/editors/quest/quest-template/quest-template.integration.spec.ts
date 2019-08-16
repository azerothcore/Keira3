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

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `quest_template` SET ' +
        '`QuestLevel` = 1, `MinLevel` = 2, `QuestSortID` = 3, `QuestInfoID` = 4, `SuggestedGroupNum` = 5, ' +
        '`RequiredFactionId1` = 6, `RequiredFactionId2` = 7, `RequiredFactionValue1` = 8, `RequiredFactionValue2` = 9, ' +
        '`RewardNextQuest` = 10, `RewardXPDifficulty` = 11, `RewardMoney` = 12, `RewardBonusMoney` = 13, ' +
        '`RewardDisplaySpell` = 14, `RewardSpell` = 15, `RewardHonor` = 16, `RewardKillHonor` = 17, `StartItem` = 18, ' +
        '`Flags` = 19, `RequiredPlayerKills` = 20, `RewardItem1` = 21, `RewardAmount1` = 22, `RewardItem2` = 23, ' +
        '`RewardAmount2` = 24, `RewardItem3` = 25, `RewardAmount3` = 26, `RewardItem4` = 27, `RewardAmount4` = 28, ' +
        '`ItemDrop1` = 29, `ItemDropQuantity1` = 30, `ItemDrop2` = 31, `ItemDropQuantity2` = 32, `ItemDrop3` = 33, ' +
        '`ItemDropQuantity3` = 34, `ItemDrop4` = 35, `ItemDropQuantity4` = 36, `RewardChoiceItemID1` = 37, ' +
        '`RewardChoiceItemQuantity1` = 38, `RewardChoiceItemID2` = 39, `RewardChoiceItemQuantity2` = 40, `RewardChoiceItemID3` = 41, ' +
        '`RewardChoiceItemQuantity3` = 42, `RewardChoiceItemID4` = 43, `RewardChoiceItemQuantity4` = 44, ' +
        '`RewardChoiceItemID5` = 45, `RewardChoiceItemQuantity5` = 46, `RewardChoiceItemID6` = 47, ' +
        '`RewardChoiceItemQuantity6` = 48, `POIContinent` = 49, `POIx` = 50, `POIy` = 51, `POIPriority` = 52, ' +
        '`RewardTitle` = 53, `RewardTalents` = 54, `RewardArenaPoints` = 55, `RewardFactionID1` = 56, `RewardFactionValue1` = 57, ' +
        '`RewardFactionOverride1` = 58, `RewardFactionID2` = 59, `RewardFactionValue2` = 60, `RewardFactionOverride2` = 61, ' +
        '`RewardFactionID3` = 62, `RewardFactionValue3` = 63, `RewardFactionOverride3` = 64, `RewardFactionID4` = 65, ' +
        '`RewardFactionValue4` = 66, `RewardFactionOverride4` = 67, `RewardFactionID5` = 68, `RewardFactionValue5` = 69, ' +
        '`RewardFactionOverride5` = 70, `TimeAllowed` = 71, `AllowableRaces` = 72, `LogTitle` = \'73\', `LogDescription` = \'74\', ' +
        '`QuestDescription` = \'75\', `AreaDescription` = \'76\', `QuestCompletionLog` = \'77\', `RequiredNpcOrGo1` = 78, ' +
        '`RequiredNpcOrGo2` = 79, `RequiredNpcOrGo3` = 80, `RequiredNpcOrGo4` = 81, `RequiredNpcOrGoCount1` = 82, ' +
        '`RequiredNpcOrGoCount2` = 83, `RequiredNpcOrGoCount3` = 84, `RequiredNpcOrGoCount4` = 85, `RequiredItemId1` = 86, ' +
        '`RequiredItemId2` = 87, `RequiredItemId3` = 88, `RequiredItemId4` = 89, `RequiredItemId5` = 90, `RequiredItemId6` = 91, ' +
        '`RequiredItemCount1` = 92, `RequiredItemCount2` = 93, `RequiredItemCount3` = 94, `RequiredItemCount4` = 95, ' +
        '`RequiredItemCount5` = 96, `RequiredItemCount6` = 97, `Unknown0` = 98, `ObjectiveText1` = \'99\', `ObjectiveText2` = \'100\', ' +
        '`ObjectiveText3` = \'101\', `ObjectiveText4` = \'102\' WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
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

