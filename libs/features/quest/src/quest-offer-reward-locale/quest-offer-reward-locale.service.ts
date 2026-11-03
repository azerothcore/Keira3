import { Service, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  QUEST_OFFER_REWARD_LOCALE_ID,
  QUEST_OFFER_REWARD_LOCALE_ID_2,
  QUEST_OFFER_REWARD_LOCALE_TABLE,
  QuestOfferRewardLocale,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Service()
export class QuestOfferRewardLocaleService extends MultiRowEditorService<QuestOfferRewardLocale> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override readonly _entityClass = QuestOfferRewardLocale;
  protected override readonly _entityTable = QUEST_OFFER_REWARD_LOCALE_TABLE;
  protected override readonly _entityIdField = QUEST_OFFER_REWARD_LOCALE_ID;
  protected override readonly _entitySecondIdField = QUEST_OFFER_REWARD_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
