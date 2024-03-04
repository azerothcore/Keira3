import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/shared/core';
import { SkinningLootTemplateComponent } from './skinning-loot-template.component';
import { SkinningLootTemplateService } from './skinning-loot-template.service';

@NgModule({
  declarations: [SkinningLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [SkinningLootTemplateComponent],
  providers: [SkinningLootTemplateService],
})
export class SkinningLootTemplateModule {}
