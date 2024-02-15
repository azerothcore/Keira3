import { NgModule } from '@angular/core';
import { ConditionsHandlerService } from './conditions-handler.service';
import { ConditionsEditorModule } from './edit-conditions/conditions-editor.module';
import { SelectConditionsModule } from './select-conditions/select-conditions.module';

const modules = [SelectConditionsModule, ConditionsEditorModule];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [ConditionsHandlerService],
})
export class ConditionsModule {}
