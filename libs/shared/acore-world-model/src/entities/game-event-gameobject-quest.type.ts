import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_GAMEOBJECT_QUEST_TABLE = 'game_event_gameobject_quest';
export const GAME_EVENT_GAMEOBJECT_QUEST_ID = 'eventEntry';
export const GAME_EVENT_GAMEOBJECT_QUEST_ID_2 = 'id';
export const GAME_EVENT_GAMEOBJECT_QUEST_ID_3 = 'quest';

export class GameEventGameobjectQuest extends TableRow {
  eventEntry: number = 0;
  id: number = 0;
  quest: number = 0;
}
