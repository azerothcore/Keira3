import { NgModule } from '@angular/core';

import { SelectConditionsModule } from './select-conditions/select-conditions.module';
import { ConditionsEditorModule } from './edit-conditions/conditions-editor.module';

const modules = [
  SelectConditionsModule,
  ConditionsEditorModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class ConditionsModule {}
