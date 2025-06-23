import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_OFFER_REWARD_ID, QUEST_OFFER_REWARD_TABLE, QuestOfferReward } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestOfferRewardService extends SingleRowEditorService<QuestOfferReward> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override _entityClass = QuestOfferReward;
  protected override _entityTable = QUEST_OFFER_REWARD_TABLE;
  protected override _entityIdField = QUEST_OFFER_REWARD_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = false;

  constructor() {
    super();
  }
}
