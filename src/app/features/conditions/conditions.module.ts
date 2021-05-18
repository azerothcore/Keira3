import { NgModule } from '@angular/core';

import { SelectConditionsModule } from './select-conditions/select-conditions.module';
import { ConditionsEditorModule } from './edit-conditions/conditions-editor.module';
import { ConditionsHandlerService } from './conditions-handler.service';

const modules = [SelectConditionsModule, ConditionsEditorModule];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [ConditionsHandlerService],
})
export class ConditionsModule {}
