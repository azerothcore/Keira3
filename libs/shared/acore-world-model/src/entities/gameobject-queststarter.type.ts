import { TableRow } from '@keira/shared/constants';

export const GAMEOBJECT_QUESTSTARTER_TABLE = 'gameobject_queststarter';
export const GAMEOBJECT_QUESTSTARTER_ID = 'quest';
export const GAMEOBJECT_QUESTSTARTER_ID_2 = 'id';

export class GameobjectQueststarter extends TableRow {
  id: number = 0;
  quest: number = 0;
}
