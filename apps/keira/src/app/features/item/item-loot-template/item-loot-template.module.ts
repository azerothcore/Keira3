import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { ItemLootTemplateComponent } from './item-loot-template.component';
import { ItemLootTemplateService } from './item-loot-template.service';

@NgModule({
  declarations: [ItemLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [ItemLootTemplateComponent],
  providers: [ItemLootTemplateService],
})
export class ItemLootTemplateModule {}
