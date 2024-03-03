import { TableRow } from '../../../keira-shared-constants/src/types/general';

export const ITEM_LIMIT_CATEGORY_TABLE = 'item_limit_category'; // sqlite
export const ITEM_LIMIT_CATEGORY_ID = 'id';
export const ITEM_LIMIT_CATEGORY_SEARCH_FIELDS = [ITEM_LIMIT_CATEGORY_ID, 'name', 'count', 'isGem'];

export class ItemLimitCategory extends TableRow {
  id: number = 0;
  name: string = '';
  count: number = 0;
  isGem: number = 0;
}
