import { NgModule } from '@angular/core';

import { SelectQuestModule } from './select-quest/select-quest.module';
import { QuestTemplateModule } from './quest-template/quest-template.module';
import { QuestTemplateAddonModule } from './quest-template-addon/quest-template-addon.module';
import { QuestOfferRewardModule } from './quest-offer-reward/quest-offer-reward.module';
import { QuestRequestItemsModule } from './quest-request-items/quest-request-items.module';

const modules = [
  SelectQuestModule,
  QuestTemplateModule,
  QuestTemplateAddonModule,
  QuestOfferRewardModule,
  QuestRequestItemsModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class QuestModule {}
