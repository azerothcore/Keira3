import { TableRow } from '../../../shared-constants/src/types/general';

export const CREATURE_QUESTITEM_TABLE = 'creature_questitem';
export const CREATURE_QUESTITEM_ID = 'CreatureEntry';
export const CREATURE_QUESTITEM_ID_2 = 'Idx';

export class CreatureQuestitem extends TableRow {
  CreatureEntry: number = 0;
  Idx: number = 0;
  ItemId: number = 0;
  VerifiedBuild: number = 0;
}
