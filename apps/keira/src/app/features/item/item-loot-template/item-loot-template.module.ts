import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira/shared/core';
import { ItemLootTemplateComponent } from './item-loot-template.component';
import { ItemLootTemplateService } from './item-loot-template.service';

@NgModule({
  imports: [CommonModule, LootEditorModule, ItemLootTemplateComponent],
  exports: [ItemLootTemplateComponent],
  providers: [ItemLootTemplateService],
})
export class ItemLootTemplateModule {}
