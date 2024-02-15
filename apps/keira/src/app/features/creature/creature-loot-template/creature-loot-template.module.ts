import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { CreatureLootTemplateService } from './creature-loot-template.service';

@NgModule({
  declarations: [CreatureLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [CreatureLootTemplateComponent],
  providers: [CreatureLootTemplateService],
})
export class CreatureLootTemplateModule {}
