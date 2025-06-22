import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_OFFER_REWARD_ID, QUEST_OFFER_REWARD_TABLE, QuestOfferReward } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestOfferRewardService extends SingleRowEditorService<QuestOfferReward> {
  protected override readonly handlerService: QuestHandlerService;

  constructor() {
    const handlerService = inject(QuestHandlerService);

    super(QuestOfferReward, QUEST_OFFER_REWARD_TABLE, QUEST_OFFER_REWARD_ID, null, false, handlerService);

    this.handlerService = handlerService;
  }
}
