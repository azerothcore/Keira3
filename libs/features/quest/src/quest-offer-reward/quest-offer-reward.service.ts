import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_OFFER_REWARD_ID, QUEST_OFFER_REWARD_TABLE, QuestOfferReward } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestOfferRewardService extends SingleRowEditorService<QuestOfferReward> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: QuestHandlerService) {
    super(QuestOfferReward, QUEST_OFFER_REWARD_TABLE, QUEST_OFFER_REWARD_ID, null, false, handlerService);
  }
}
