import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_GAMEOBJECT_TABLE = 'game_event_gameobject';
export const GAME_EVENT_GAMEOBJECT_ID = 'eventEntry';
export const GAME_EVENT_GAMEOBJECT_ID_2 = 'guid';

export class GameEventGameobject extends TableRow {
  eventEntry: number = 0;
  guid: number = 0;
}
