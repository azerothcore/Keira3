import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { QuestTemplate } from '@keira-types/quest-template.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestModule } from '../quest.module';
import { QuestTemplateComponent } from './quest-template.component';

class QuestTemplatePage extends EditorPageObject<QuestTemplateComponent> {
  get questPreviewTitle() {
    return this.query(`${this.PREVIEW_CONTAINER_SELECTOR} #title`);
  }
}

describe('QuestTemplate integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `quest_template` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_template` (`ID`, `QuestType`, `QuestLevel`, `MinLevel`, `QuestSortID`, `QuestInfoID`, `SuggestedGroupNum`, ' +
    '`RequiredFactionId1`, `RequiredFactionId2`, `RequiredFactionValue1`, `RequiredFactionValue2`, ' +
    '`RewardNextQuest`, `RewardXPDifficulty`, `RewardMoney`, `RewardMoneyDifficulty`, `RewardBonusMoney`, ' +
    '`RewardDisplaySpell`, `RewardSpell`, `RewardHonor`, `RewardKillHonor`, `StartItem`, `Flags`, `RequiredPlayerKills`, ' +
    '`RewardItem1`, `RewardAmount1`, `RewardItem2`, `RewardAmount2`, `RewardItem3`, `RewardAmount3`, `RewardItem4`, `RewardAmount4`, ' +
    '`ItemDrop1`, `ItemDropQuantity1`, `ItemDrop2`, `ItemDropQuantity2`, `ItemDrop3`, `ItemDropQuantity3`, `ItemDrop4`, `ItemDropQuantity4`, ' +
    '`RewardChoiceItemID1`, `RewardChoiceItemQuantity1`, `RewardChoiceItemID2`, `RewardChoiceItemQuantity2`, ' +
    '`RewardChoiceItemID3`, `RewardChoiceItemQuantity3`, `RewardChoiceItemID4`, `RewardChoiceItemQuantity4`, ' +
    '`RewardChoiceItemID5`, `RewardChoiceItemQuantity5`, `RewardChoiceItemID6`, `RewardChoiceItemQuantity6`, ' +
    '`POIContinent`, `POIx`, `POIy`, `POIPriority`, `RewardTitle`, `RewardTalents`, `RewardArenaPoints`, ' +
    '`RewardFactionID1`, `RewardFactionValue1`, `RewardFactionOverride1`, `RewardFactionID2`, `RewardFactionValue2`, `RewardFactionOverride2`, ' +
    '`RewardFactionID3`, `RewardFactionValue3`, `RewardFactionOverride3`, `RewardFactionID4`, `RewardFactionValue4`, `RewardFactionOverride4`, ' +
    '`RewardFactionID5`, `RewardFactionValue5`, `RewardFactionOverride5`, `TimeAllowed`, `AllowableRaces`, `LogTitle`, ' +
    '`LogDescription`, `QuestDescription`, `AreaDescription`, `QuestCompletionLog`, ' +
    '`RequiredNpcOrGo1`, `RequiredNpcOrGo2`, `RequiredNpcOrGo3`, `RequiredNpcOrGo4`, ' +
    '`RequiredNpcOrGoCount1`, `RequiredNpcOrGoCount2`, `RequiredNpcOrGoCount3`, `RequiredNpcOrGoCount4`, ' +
    '`RequiredItemId1`, `RequiredItemId2`, `RequiredItemId3`, `RequiredItemId4`, `RequiredItemId5`, `RequiredItemId6`, ' +
    '`RequiredItemCount1`, `RequiredItemCount2`, `RequiredItemCount3`, `RequiredItemCount4`, `RequiredItemCount5`, `RequiredItemCount6`, ' +
    '`Unknown0`, `ObjectiveText1`, `ObjectiveText2`, `ObjectiveText3`, `ObjectiveText4`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', 0);";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, QuestModule, TranslateTestingModule],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalEntity = new QuestTemplate();
    originalEntity.ID = id;

    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.and.callThrough();
    }

    const fixture = TestBed.createComponent(QuestTemplateComponent);
    const component = fixture.componentInstance;
    const page = new QuestTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, initializeServicesSpy, fixture, component, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'QuestInfoID';
      expect(handlerService.isQuestTemplateUnsaved).toBe(false);
      page.setInputValueById(field, 81);
      expect(handlerService.isQuestTemplateUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestTemplateUnsaved).toBe(false);
      page.removeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      querySpy.calls.reset();

      page.setInputValueById('LogTitle', 'Shin');
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('Shin');

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain('Shin');
      page.removeElement();
    });

    it('changing a property should be reflected in the quest preview', () => {
      const { page } = setup(true);
      const value = 'Fix all AzerothCore bugs';

      page.setInputValueById('LogTitle', value);

      expect(page.questPreviewTitle.innerText).toContain(value);
      page.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy, originalEntity } = setup(false);
      const expectedQuery =
        'UPDATE `quest_template` SET `QuestLevel` = 1, `MinLevel` = 2, `QuestSortID` = 3, `QuestInfoID` = 4, ' +
        '`SuggestedGroupNum` = 5, `RequiredFactionId1` = 6, `RequiredFactionId2` = 7, `RequiredFactionValue1` = 8, ' +
        '`RequiredFactionValue2` = 9, `RewardNextQuest` = 10, `RewardXPDifficulty` = 11, `RewardMoney` = 12, ' +
        '`RewardMoneyDifficulty` = 13, `RewardBonusMoney` = 14, `RewardDisplaySpell` = 15, `RewardSpell` = 16, ' +
        '`RewardHonor` = 17, `RewardKillHonor` = 18, `StartItem` = 19, `Flags` = 20, `RequiredPlayerKills` = 21, ' +
        '`RewardItem1` = 22, `RewardAmount1` = 23, `RewardItem2` = 24, `RewardAmount2` = 25, `RewardItem3` = 26, ' +
        '`RewardAmount3` = 27, `RewardItem4` = 28, `RewardAmount4` = 29, `ItemDrop1` = 30, `ItemDropQuantity1` = 31, ' +
        '`ItemDrop2` = 32, `ItemDropQuantity2` = 33, `ItemDrop3` = 34, `ItemDropQuantity3` = 35, `ItemDrop4` = 36, ' +
        '`ItemDropQuantity4` = 37, `RewardChoiceItemID1` = 38, `RewardChoiceItemQuantity1` = 39, `RewardChoiceItemID2` = 40, ' +
        '`RewardChoiceItemQuantity2` = 41, `RewardChoiceItemID3` = 42, `RewardChoiceItemQuantity3` = 43, `RewardChoiceItemID4` = 44, ' +
        '`RewardChoiceItemQuantity4` = 45, `RewardChoiceItemID5` = 46, `RewardChoiceItemQuantity5` = 47, `RewardChoiceItemID6` = 48, ' +
        '`RewardChoiceItemQuantity6` = 49, `POIContinent` = 50, `POIx` = 51, `POIy` = 52, `POIPriority` = 53, `RewardTitle` = 54, ' +
        '`RewardTalents` = 55, `RewardArenaPoints` = 56, `RewardFactionID1` = 57, `RewardFactionValue1` = 58, ' +
        '`RewardFactionOverride1` = 59, `RewardFactionID2` = 60, `RewardFactionValue2` = 61, `RewardFactionOverride2` = 62, ' +
        '`RewardFactionID3` = 63, `RewardFactionValue3` = 64, `RewardFactionOverride3` = 65, `RewardFactionID4` = 66, ' +
        '`RewardFactionValue4` = 67, `RewardFactionOverride4` = 68, `RewardFactionID5` = 69, `RewardFactionValue5` = 70, ' +
        "`RewardFactionOverride5` = 71, `TimeAllowed` = 72, `AllowableRaces` = 73, `LogTitle` = '74', `LogDescription` = '75', " +
        "`QuestDescription` = '76', `AreaDescription` = '77', `QuestCompletionLog` = '78', `RequiredNpcOrGo1` = 79, " +
        '`RequiredNpcOrGo2` = 80, `RequiredNpcOrGo3` = 81, `RequiredNpcOrGo4` = 82, `RequiredNpcOrGoCount1` = 83, ' +
        '`RequiredNpcOrGoCount2` = 84, `RequiredNpcOrGoCount3` = 85, `RequiredNpcOrGoCount4` = 86, `RequiredItemId1` = 87, ' +
        '`RequiredItemId2` = 88, `RequiredItemId3` = 89, `RequiredItemId4` = 90, `RequiredItemId5` = 91, `RequiredItemId6` = 92, ' +
        '`RequiredItemCount1` = 93, `RequiredItemCount2` = 94, `RequiredItemCount3` = 95, `RequiredItemCount4` = 96, ' +
        "`RequiredItemCount5` = 97, `RequiredItemCount6` = 98, `Unknown0` = 99, `ObjectiveText1` = '100', `ObjectiveText2` = '101', " +
        "`ObjectiveText3` = '102', `ObjectiveText4` = '103' WHERE (`ID` = 1234);";
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(6);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('LogTitle', 'Shin');
      page.expectDiffQueryToContain("UPDATE `quest_template` SET `LogTitle` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain('Shin');

      page.setInputValueById('MinLevel', 22);
      page.expectDiffQueryToContain("UPDATE `quest_template` SET `MinLevel` = 22, `LogTitle` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain('Shin');
      page.expectFullQueryToContain('22');
      page.removeElement();
    });

    xit('changing a value via FlagsSelector should correctly work', waitForAsync(async () => {
      const { page } = setup(false);
      const field = 'Flags';
      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.toggleFlagInRowExternal(2);
      await page.whenReady();
      page.toggleFlagInRowExternal(12);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('4100');
      page.expectDiffQueryToContain('UPDATE `quest_template` SET `Flags` = 4100 WHERE (`ID` = 1234);');

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('4100');
      page.removeElement();
    }));
  });
});
