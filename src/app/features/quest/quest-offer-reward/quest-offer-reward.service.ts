import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from '../quest-handler.service';
import { QueryService } from '@keira-shared/services/query.service';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  QUEST_OFFER_REWARD_ID,
  QUEST_OFFER_REWARD_TABLE,
  QuestOfferReward
} from '@keira-types/quest-offer-reward.type';

@Injectable()
export class QuestOfferRewardService extends SingleRowEditorService<QuestOfferReward> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      QuestOfferReward,
      QUEST_OFFER_REWARD_TABLE,
      QUEST_OFFER_REWARD_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
