import { TableRow } from './general';

export const CREATURE_QUESTITEM_TABLE = 'creature_questitem';
export const CREATURE_QUESTITEM_ID = 'CreatureEntry';
export const CREATURE_QUESTITEM_ID_2 = 'ItemId';

export class CreatureQuestitem extends TableRow {
  CreatureEntry: number = 0;
  Idx: number = 0;
  ItemId: number = 0;
  VerifiedBuild: number = 0;
}
