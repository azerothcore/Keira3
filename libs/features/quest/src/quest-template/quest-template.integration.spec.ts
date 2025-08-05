import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { QuestTemplate } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateComponent } from './quest-template.component';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

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
    '`RewardNextQuest`, `RewardXPDifficulty`, `RewardMoney`, `RewardMoneyDifficulty`, ' +
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
    "(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', 0);";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, QuestTemplateComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
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
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'QuestInfoID';
      expect(handlerService.isQuestTemplateUnsaved()).toBe(false);
      page.setInputValueById(field, 81);
      expect(handlerService.isQuestTemplateUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestTemplateUnsaved()).toBe(false);
      page.removeNativeElement();
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
      page.removeNativeElement();
    });

    // TODO: fix this test, broken after OnPush (probably needs tick())
    xit('changing a property should be reflected in the quest preview', () => {
      const { page } = setup(true);
      const value = 'Fix all AzerothCore bugs';
      page.detectChanges();

      page.setInputValueById('LogTitle', value);

      expect(page.questPreviewTitle.innerText).toContain(value);
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy, originalEntity } = setup(false);
      const expectedQuery =
        'UPDATE `quest_template` SET `QuestLevel` = 1, `MinLevel` = 2, `QuestSortID` = 3, `QuestInfoID` = 4, `SuggestedGroupNum` = 5, ' +
        '`RequiredFactionId1` = 6, `RequiredFactionId2` = 7, `RequiredFactionValue1` = 8, `RequiredFactionValue2` = 9, ' +
        '`RewardNextQuest` = 10, `RewardXPDifficulty` = 11, `RewardMoney` = 12, `RewardMoneyDifficulty` = 13, ' +
        '`RewardDisplaySpell` = 14, `RewardSpell` = 15, `RewardHonor` = 16, `RewardKillHonor` = 17, `StartItem` = 18, ' +
        '`Flags` = 19, `RequiredPlayerKills` = 20, `RewardItem1` = 21, `RewardAmount1` = 22, `RewardItem2` = 23, `RewardAmount2` = 24, ' +
        '`RewardItem3` = 25, `RewardAmount3` = 26, `RewardItem4` = 27, `RewardAmount4` = 28, `ItemDrop1` = 29, `ItemDropQuantity1` = 30, ' +
        '`ItemDrop2` = 31, `ItemDropQuantity2` = 32, `ItemDrop3` = 33, `ItemDropQuantity3` = 34, `ItemDrop4` = 35, ' +
        '`ItemDropQuantity4` = 36, `RewardChoiceItemID1` = 37, `RewardChoiceItemQuantity1` = 38, `RewardChoiceItemID2` = 39, ' +
        '`RewardChoiceItemQuantity2` = 40, `RewardChoiceItemID3` = 41, `RewardChoiceItemQuantity3` = 42, `RewardChoiceItemID4` = 43, ' +
        '`RewardChoiceItemQuantity4` = 44, `RewardChoiceItemID5` = 45, `RewardChoiceItemQuantity5` = 46, `RewardChoiceItemID6` = 47, ' +
        '`RewardChoiceItemQuantity6` = 48, `POIContinent` = 49, `POIx` = 50, `POIy` = 51, `POIPriority` = 52, `RewardTitle` = 53, ' +
        '`RewardTalents` = 54, `RewardArenaPoints` = 55, `RewardFactionID1` = 56, `RewardFactionValue1` = 57, ' +
        '`RewardFactionOverride1` = 58, `RewardFactionID2` = 59, `RewardFactionValue2` = 60, `RewardFactionOverride2` = 61, ' +
        '`RewardFactionID3` = 62, `RewardFactionValue3` = 63, `RewardFactionOverride3` = 64, `RewardFactionID4` = 65, ' +
        '`RewardFactionValue4` = 66, `RewardFactionOverride4` = 67, `RewardFactionID5` = 68, `RewardFactionValue5` = 69, ' +
        '`RewardFactionOverride5` = 70, `TimeAllowed` = 71, `AllowableRaces` = 72, ' +
        "`LogTitle` = '73', `LogDescription` = '74', `QuestDescription` = '75', `AreaDescription` = '76'," +
        " `QuestCompletionLog` = '77', `RequiredNpcOrGo1` = 78, `RequiredNpcOrGo2` = 79, `RequiredNpcOrGo3` = 80, " +
        '`RequiredNpcOrGo4` = 81, `RequiredNpcOrGoCount1` = 82, `RequiredNpcOrGoCount2` = 83, `RequiredNpcOrGoCount3` = 84, ' +
        '`RequiredNpcOrGoCount4` = 85, `RequiredItemId1` = 86, `RequiredItemId2` = 87, `RequiredItemId3` = 88, `RequiredItemId4` = 89, ' +
        '`RequiredItemId5` = 90, `RequiredItemId6` = 91, `RequiredItemCount1` = 92, `RequiredItemCount2` = 93, `RequiredItemCount3` = 94,' +
        " `RequiredItemCount4` = 95, `RequiredItemCount5` = 96, `RequiredItemCount6` = 97, `Unknown0` = 98, `ObjectiveText1` = '99', " +
        "`ObjectiveText2` = '100', `ObjectiveText3` = '101', `ObjectiveText4` = '102' WHERE (`ID` = 1234);";
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
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
      page.removeNativeElement();
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
      page.removeNativeElement();
    }));
  });
});
