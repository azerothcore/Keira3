import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_CREATURE_QUEST_TABLE = 'game_event_creature_quest';
export const GAME_EVENT_CREATURE_QUEST_ID = 'eventEntry';
export const GAME_EVENT_CREATURE_QUEST_ID_2 = 'id';
export const GAME_EVENT_CREATURE_QUEST_ID_3 = 'quest';

export class GameEventCreatureQuest extends TableRow {
  eventEntry: number = 0;
  id: number = 0;
  quest: number = 0;
}
