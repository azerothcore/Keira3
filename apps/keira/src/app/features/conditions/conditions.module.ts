import { NgModule } from '@angular/core';
import { ConditionsHandlerService } from './conditions-handler.service';
import { ConditionsEditorModule } from './edit-conditions/conditions-editor.module';

const modules = [ConditionsEditorModule];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [ConditionsHandlerService],
})
export class ConditionsModule {}
