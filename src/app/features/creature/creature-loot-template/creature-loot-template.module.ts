import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { CreatureLootTemplateService } from './creature-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

@NgModule({
  declarations: [CreatureLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [CreatureLootTemplateComponent],
  providers: [CreatureLootTemplateService],
})
export class CreatureLootTemplateModule {}
