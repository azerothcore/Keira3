import { TableRow } from '@keira/shared/constants';

export const ITEM_ENCHANTMENT_TABLE = 'item_enchantment'; // sqlite
export const ITEM_ENCHANTMENT_ID = 'id';
export const ITEM_ENCHANTMENT_SEARCH_FIELDS = [ITEM_ENCHANTMENT_ID, 'name', 'conditionId'];

export class ItemEnchantment extends TableRow {
  id: number = 0;
  name: string = '';
  conditionId: number = 0;
}
