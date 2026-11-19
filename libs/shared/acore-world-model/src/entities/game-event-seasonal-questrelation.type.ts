import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_SEASONAL_QUEST_TABLE = 'game_event_seasonal_questrelation';
export const GAME_EVENT_SEASONAL_QUEST_ID = 'eventEntry';
export const GAME_EVENT_SEASONAL_QUEST_ID_2 = 'questId';

export class GameEventSeasonalQuest extends TableRow {
  eventEntry: number = 0;
  questId: number = 0;
}
