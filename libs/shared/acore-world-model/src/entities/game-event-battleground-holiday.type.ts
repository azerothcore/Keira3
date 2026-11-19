import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_BATTLEGROUND_HOLIDAY_TABLE = 'game_event_battleground_holiday';
export const GAME_EVENT_BATTLEGROUND_HOLIDAY_ID = 'eventEntry';
export const GAME_EVENT_BATTLEGROUND_HOLIDAY_ID_2 = 'bgflag';

export class GameEventBattlegroundHoliday extends TableRow {
  eventEntry: number = 0;
  bgflag: number = 0;
}
