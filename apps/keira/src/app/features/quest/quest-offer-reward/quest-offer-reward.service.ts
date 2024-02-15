import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { QuestOfferReward, QUEST_OFFER_REWARD_ID, QUEST_OFFER_REWARD_TABLE } from '@keira-types/quest-offer-reward.type';
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
