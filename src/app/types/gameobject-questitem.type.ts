import { TableRow } from './general';

export const GAMEOBJECT_QUESTITEM_TABLE = 'gameobjet_questitem';
export const GAMEOBJECT_QUESTITEM_ID = 'GameobjectEntry';

export class GameobjectQuestitem extends TableRow {
  GameobjectEntry: number = 0;
  Idx: number = 0;
  ItemId: number = 0;
  VerifiedBuild: number = 0;
}
