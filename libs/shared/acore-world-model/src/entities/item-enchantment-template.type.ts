import { TableRow } from '@keira/shared/constants';

export const ITEM_ENCHANTMENT_TEMPLATE_TABLE = 'item_enchantment_template';
export const ITEM_ENCHANTMENT_TEMPLATE_ID = 'entry';
export const ITEM_ENCHANTMENT_TEMPLATE_ID_2 = 'ench';

export class ItemEnchantmentTemplate extends TableRow {
  entry: number = 0;
  ench: number = 0;
  chance: number = 0;
}
