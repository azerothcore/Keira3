import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { SkinningLootTemplateComponent } from './skinning-loot-template.component';
import { SkinningLootTemplateService } from './skinning-loot-template.service';

@NgModule({
  declarations: [SkinningLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [SkinningLootTemplateComponent],
  providers: [SkinningLootTemplateService],
})
export class SkinningLootTemplateModule {}
