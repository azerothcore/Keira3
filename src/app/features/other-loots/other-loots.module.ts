import { NgModule } from '@angular/core';

import { ReferenceLootTemplateModule } from './reference-loot/reference-loot-template.module';
import { SpellLootTemplateModule } from './spell-loot/spell-loot-template.module';

const modules = [
  ReferenceLootTemplateModule,
  SpellLootTemplateModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class OtherLootsModule {}
