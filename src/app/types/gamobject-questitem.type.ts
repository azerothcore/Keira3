import { TableRow } from './general';

export const GAMEOBJECT_QUESTITEM_TABLE = 'gameobjet_questitem';
export const GAMEOBJECT_QUESTITEM_ID = 'GameObjectEntry';

export class GameObjectQuestItem extends TableRow {
  GameObjectEntry: number = 0;
  Idx: number = 0;
  ItemId: number = 0;
  VerifiedBuild: number = 0;
}
