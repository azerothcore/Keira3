import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/shared/core';
import { QUEST_OFFER_REWARD_ID, QUEST_OFFER_REWARD_TABLE, QuestOfferReward } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
export class QuestOfferRewardService extends SingleRowEditorService<QuestOfferReward> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(QuestOfferReward, QUEST_OFFER_REWARD_TABLE, QUEST_OFFER_REWARD_ID, null, false, handlerService, queryService, toastrService);
  }
}
