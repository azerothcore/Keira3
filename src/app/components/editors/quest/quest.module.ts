import { NgModule } from '@angular/core';

import { SelectQuestModule } from './select-quest/select-quest.module';
import { QuestTemplateModule } from './quest-template/quest-template.module';

const modules = [
  SelectQuestModule,
  QuestTemplateModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class QuestModule {}
