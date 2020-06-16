import { NgModule } from '@angular/core';

import { ReferenceLootTemplateModule } from './reference-loot/reference-loot-template.module';

const modules = [
  ReferenceLootTemplateModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class OtherLootsModule {}
