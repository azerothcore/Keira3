import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_ARENA_SEASON_TABLE = 'game_event_arena_seasons';
export const GAME_EVENT_ARENA_SEASON_ID = 'eventEntry';
export const GAME_EVENT_ARENA_SEASON_ID_2 = 'season';

export class GameEventArenaSeason extends TableRow {
  eventEntry: number = 0;
  season: number = 0;
}
