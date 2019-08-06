import { TableRow } from './general';

export const CREATURE_QUESTSTARTER_TABLE = 'creature_queststarter';
export const CREATURE_QUESTSTARTER_ID = 'quest';
export const CREATURE_QUESTSTARTER_ID_2 = 'id';

export class CreatureQueststarter extends TableRow {
  id: number = 0;
  quest: number = 0;
}
