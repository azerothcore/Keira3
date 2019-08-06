import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  QUEST_OFFER_REWARD_ID,
  QUEST_OFFER_REWARD_TABLE,
  QuestOfferReward
} from '../../../types/quest-offer-reward.type';

@Injectable({
  providedIn: 'root'
})
export class QuestOfferRewardService extends SingleRowEditorService<QuestOfferReward> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      QuestOfferReward,
      QUEST_OFFER_REWARD_TABLE,
      QUEST_OFFER_REWARD_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}
