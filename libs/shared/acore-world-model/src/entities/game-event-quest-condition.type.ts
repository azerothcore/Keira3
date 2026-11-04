import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_QUEST_CONDITION_TABLE = 'game_event_quest_condition';
export const GAME_EVENT_QUEST_CONDITION_ID = 'eventEntry';
export const GAME_EVENT_QUEST_CONDITION_ID_2 = 'quest';

export class GameEventQuestCondition extends TableRow {
  eventEntry: number = 0;
  quest: number = 0;
  condition_id: number = 0;
  num: number = 0;
}
