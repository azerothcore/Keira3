import { NgModule } from '@angular/core';

import { SelectConditionsModule } from './select-conditions/select-conditions.module';

const modules = [
  SelectConditionsModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class ConditionsModule {}
