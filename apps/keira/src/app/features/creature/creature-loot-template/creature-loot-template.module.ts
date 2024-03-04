import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/core';
import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { CreatureLootTemplateService } from './creature-loot-template.service';

@NgModule({
  declarations: [CreatureLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [CreatureLootTemplateComponent],
  providers: [CreatureLootTemplateService],
})
export class CreatureLootTemplateModule {}
