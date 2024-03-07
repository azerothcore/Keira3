import { TableRow } from '@keira/shared/constants';

export const LOOT_TEMPLATE_ID = 'Entry';
export const LOOT_TEMPLATE_ID_2 = 'Item';

export class LootTemplate extends TableRow {
  Entry: number = 0;
  Item: number = 0;
  Reference: number = 0;
  Chance: number = 100;
  QuestRequired: number = 0;
  LootMode: number = 1;
  GroupId: number = 0;
  MinCount: number = 1;
  MaxCount: number = 1;
  Comment: string = '';
}
