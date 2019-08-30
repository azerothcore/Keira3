import { NgModule } from '@angular/core';
import { ItemTemplateModule } from './item-template/item-template.module';
import { SelectItemModule } from './select-item/select-item.module';
import { ItemLootTemplateModule } from './item-loot-template/item-loot-template.module';
import { DisenchantLootTemplateModule } from './disenchant-loot-template/disenchant-loot-template.module';
import { ProspectingLootTemplateModule } from './prospecting-loot-template/prospecting-loot-template.module';
import { MillingLootTemplateModule } from './milling-loot-template/milling-loot-template.module';
import { ItemEnchantmentTemplateModule } from './item-enchantment/item-enchantment-template.module';

const modules = [
  SelectItemModule,
  ItemTemplateModule,
  ItemEnchantmentTemplateModule,
  ItemLootTemplateModule,
  DisenchantLootTemplateModule,
  ProspectingLootTemplateModule,
  MillingLootTemplateModule
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class ItemModule {}
