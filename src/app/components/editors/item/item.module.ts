import { NgModule } from '@angular/core';
import { ItemTemplateModule } from './item-template/item-template.module';
import { SelectItemModule } from './select-item/select-item.module';
import { ItemLootTemplateModule } from './item-loot-template/item-loot-template.module';

const modules = [
  SelectItemModule,
  ItemTemplateModule,
  ItemLootTemplateModule
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class ItemModule {}
