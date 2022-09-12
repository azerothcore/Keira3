import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FishingLootTemplateModule } from './fishing-loot/fishing-loot-template.module';
import { MailLootTemplateModule } from './mail-loot/mail-loot-template.module';
import { ReferenceLootTemplateModule } from './reference-loot/reference-loot-template.module';
import { SpellLootTemplateModule } from './spell-loot/spell-loot-template.module';

const modules = [ReferenceLootTemplateModule, SpellLootTemplateModule, FishingLootTemplateModule, MailLootTemplateModule];

@NgModule({
  imports: [modules, TranslateModule],
  exports: [modules],
})
export class OtherLootsModule {}
