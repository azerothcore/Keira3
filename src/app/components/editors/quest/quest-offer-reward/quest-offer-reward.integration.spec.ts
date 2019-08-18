import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { QuestOfferRewardComponent } from './quest-offer-reward.component';
import { QuestOfferRewardModule } from './quest-offer-reward.module';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { QuestOfferReward } from '../../../../types/quest-offer-reward.type';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';

class QuestOfferRewardPage extends EditorPageObject<QuestOfferRewardComponent> {}

describe('QuestOfferReward integration tests', () => {
  let component: QuestOfferRewardComponent;
  let fixture: ComponentFixture<QuestOfferRewardComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: QuestOfferRewardPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
    '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, 0, 0, \'\', 0);';

  const originalEntity = new QuestOfferReward();
  originalEntity.ID = id;
  originalEntity.Emote1 = 2;
  originalEntity.Emote2 = 3;
  originalEntity.Emote3 = 4;
  originalEntity.Emote4 = 5;
  originalEntity.EmoteDelay1 = 6;
  originalEntity.EmoteDelay2 = 7;
  originalEntity.EmoteDelay3 = 8;
  originalEntity.EmoteDelay4 = 9;
  originalEntity.RewardText = '10';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        QuestOfferRewardModule,
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

    fixture = TestBed.createComponent(QuestOfferRewardComponent);
    component = fixture.componentInstance;
    page = new QuestOfferRewardPage(fixture);
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
      const expectedQuery = 'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 33, 0, 0, 0, 0, 0, 0, 0, \'\', 0);';
      querySpy.calls.reset();

      page.setInputValueById('Emote1', 33);
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
      page.expectFullQueryToContain('DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 2, 3, 4, 5, 6, 7, 8, 9, \'10\', 0);');
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `quest_offer_reward` SET `Emote1` = 0, `Emote2` = 1, `Emote3` = 2, `Emote4` = 3, ' +
        '`EmoteDelay1` = 4, `EmoteDelay2` = 5, `EmoteDelay3` = 6, `EmoteDelay4` = 7, `RewardText` = \'8\' WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('Emote1', '11');
      page.expectDiffQueryToContain(
        'UPDATE `quest_offer_reward` SET `Emote1` = 11 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 11, 3, 4, 5, 6, 7, 8, 9, \'10\', 0);'
      );

      page.setInputValueById('Emote2', '22');
      page.expectDiffQueryToContain(
        'UPDATE `quest_offer_reward` SET `Emote1` = 11, `Emote2` = 22 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 11, 22, 4, 5, 6, 7, 8, 9, \'10\', 0);'
      );
    });

    it('changing a value via SingleValueSelector should correctly work', () => {
      const field = 'Emote1';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.clickRowOfDatatable(4);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('4');
      page.expectDiffQueryToContain(
        'UPDATE `quest_offer_reward` SET `Emote1` = 4 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 4, 3, 4, 5, 6, 7, 8, 9, \'10\', 0);'
      );
    });
  });
});
