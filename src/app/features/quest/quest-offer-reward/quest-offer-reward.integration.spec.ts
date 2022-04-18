import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { QuestOfferReward } from '@keira-types/quest-offer-reward.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestModule } from '../quest.module';
import { QuestOfferRewardComponent } from './quest-offer-reward.component';

class QuestOfferRewardPage extends EditorPageObject<QuestOfferRewardComponent> {
  get completionText() {
    return this.query<HTMLDivElement>('#completion-text');
  }
}

describe('QuestOfferReward integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
    '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, 0, 0, 0, 0, 0, 0, '', 0);";

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

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, QuestModule],
      }).compileComponents();
    }),
  );

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.and.callThrough();
    }

    const fixture = TestBed.createComponent(QuestOfferRewardComponent);
    const component = fixture.componentInstance;
    const page = new QuestOfferRewardPage(fixture);
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
      const field = 'Emote1';
      expect(handlerService.isQuestOfferRewardUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isQuestOfferRewardUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestOfferRewardUnsaved).toBe(false);
      page.removeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
        '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
        "(1234, 33, 0, 0, 0, 0, 0, 0, 0, '', 0);";
      querySpy.calls.reset();

      page.setInputValueById('Emote1', 33);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeElement();
    });

    it('changing a property should be reflected in the quest preview', () => {
      const { page } = setup(true);
      const value = 'Fix all AzerothCore bugs';

      page.setInputValueById('RewardText', value);

      expect(page.completionText.innerText).toContain(value);
      page.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
          '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 2, 3, 4, 5, 6, 7, 8, 9, '10', 0);",
      );
      page.removeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery =
        'UPDATE `quest_offer_reward` SET `Emote1` = 0, `Emote2` = 1, `Emote3` = 2, `Emote4` = 3, ' +
        "`EmoteDelay1` = 4, `EmoteDelay2` = 5, `EmoteDelay3` = 6, `EmoteDelay4` = 7, `RewardText` = '8' WHERE (`ID` = 1234);";
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('Emote1', '11');
      page.expectDiffQueryToContain('UPDATE `quest_offer_reward` SET `Emote1` = 11 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
          '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 11, 3, 4, 5, 6, 7, 8, 9, '10', 0);",
      );

      page.setInputValueById('Emote2', '22');
      page.expectDiffQueryToContain('UPDATE `quest_offer_reward` SET `Emote1` = 11, `Emote2` = 22 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
          '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 11, 22, 4, 5, 6, 7, 8, 9, '10', 0);",
      );
      page.removeElement();
    });

    xit(
      'changing a value via SingleValueSelector should correctly work',
      waitForAsync(async () => {
        const { page } = setup(false);
        const field = 'Emote1';
        page.clickElement(page.getSelectorBtn(field));

        await page.whenReady();
        page.expectModalDisplayed();

        page.clickRowOfDatatableInModal(4);

        await page.whenReady();
        page.clickModalSelect();
        await page.whenReady();

        expect(page.getInputById(field).value).toEqual('4');
        page.expectDiffQueryToContain('UPDATE `quest_offer_reward` SET `Emote1` = 4 WHERE (`ID` = 1234);');
        page.expectFullQueryToContain(
          'DELETE FROM `quest_offer_reward` WHERE (`ID` = 1234);\n' +
            'INSERT INTO `quest_offer_reward` (`ID`, `Emote1`, `Emote2`, `Emote3`, `Emote4`, ' +
            '`EmoteDelay1`, `EmoteDelay2`, `EmoteDelay3`, `EmoteDelay4`, `RewardText`, `VerifiedBuild`) VALUES\n' +
            "(1234, 4, 3, 4, 5, 6, 7, 8, 9, '10', 0);",
        );
        page.removeElement();
      }),
    );
  });
});
