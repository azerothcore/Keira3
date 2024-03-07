import { TableRow } from '@keira/shared/constants';

export const ITEM_EXTENDED_COST_TABLE = 'item_extended_cost'; // sqlite
export const ITEM_EXTENDED_COST_ID = 'id';
export const ITEM_EXTENDED_COST_SEARCH_FIELDS = [
  ITEM_EXTENDED_COST_ID,
  'reqHonorPoints',
  'reqArenaPoints',
  'reqArenaSlot',
  'reqItemId1',
  'reqItemId2',
  'reqItemId3',
  'reqItemId4',
  'reqItemId5',
  'reqPersonalRating',
];

export class ItemExtendedCost extends TableRow {
  id: number = 0;
  reqHonorPoints: number = 0;
  reqArenaPoints: number = 0;
  reqArenaSlot: number = 0;
  reqItemId1: number = 0;
  reqItemId2: number = 0;
  reqItemId3: number = 0;
  reqItemId4: number = 0;
  reqItemId5: number = 0;
  itemCount1: number = 0;
  itemCount2: number = 0;
  itemCount3: number = 0;
  itemCount4: number = 0;
  itemCount5: number = 0;
  reqPersonalRating: number = 0;
}
