import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/core';
import { ItemLootTemplateComponent } from './item-loot-template.component';
import { ItemLootTemplateService } from './item-loot-template.service';

@NgModule({
  declarations: [ItemLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [ItemLootTemplateComponent],
  providers: [ItemLootTemplateService],
})
export class ItemLootTemplateModule {}
