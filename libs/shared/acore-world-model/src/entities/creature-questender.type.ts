import { TableRow } from '../../../constants/src/types/general';

export const CREATURE_QUESTENDER_TABLE = 'creature_questender';
export const CREATURE_QUESTENDER_ID = 'quest';
export const CREATURE_QUESTENDER_ID_2 = 'id';

export class CreatureQuestender extends TableRow {
  id: number = 0;
  quest: number = 0;
}
