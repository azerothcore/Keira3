import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira/shared/core';
import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { CreatureLootTemplateService } from './creature-loot-template.service';

@NgModule({
  imports: [CommonModule, LootEditorModule, CreatureLootTemplateComponent],
  exports: [CreatureLootTemplateComponent],
  providers: [CreatureLootTemplateService],
})
export class CreatureLootTemplateModule {}
