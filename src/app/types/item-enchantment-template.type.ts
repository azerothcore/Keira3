import { TableRow } from './general';

export const ITEM_ENCHANTMENT_TEMPLATE_TABLE = 'item_enchantment_template';
export const ITEM_ENCHANTMENT_TEMPLATE_ID = 'entry';

export class ItemEnchantmentTemplate extends TableRow {
  entry: number = 0;
  ench: number = 0;
  chance: number = 0;
}
