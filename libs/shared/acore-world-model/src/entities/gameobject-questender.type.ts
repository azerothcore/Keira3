import { TableRow } from '@keira/shared/constants';

export const GAMEOBJECT_QUESTENDER_TABLE = 'gameobject_questender';
export const GAMEOBJECT_QUESTENDER_ID = 'quest';
export const GAMEOBJECT_QUESTENDER_ID_2 = 'id';

export class GameobjectQuestender extends TableRow {
  id: number = 0;
  quest: number = 0;
}
