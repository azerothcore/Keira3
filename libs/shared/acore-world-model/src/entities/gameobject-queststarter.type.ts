import { TableRow } from '../../../constants/src/types/general';

export const GAMEOBJECT_QUESTSTARTER_TABLE = 'gameobject_queststarter';
export const GAMEOBJECT_QUESTSTARTER_ID = 'quest';
export const GAMEOBJECT_QUESTSTARTER_ID_2 = 'id';

export class GameobjectQueststarter extends TableRow {
  id: number = 0;
  quest: number = 0;
}
