import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_TABLE = 'game_event';
export const GAME_EVENT_ID = 'eventEntry';
export const GAME_EVENT_NAME = 'description';
export const GAME_EVENT_CUSTOM_STARTING_ID = 1;
/** eventEntry is a tinyint unsigned. */
export const GAME_EVENT_MAX_ID = 255;
export const GAME_EVENT_SEARCH_FIELDS = [GAME_EVENT_ID, GAME_EVENT_NAME];

export class GameEvent extends TableRow {
  eventEntry: number = 0;
  start_time: string = '2000-01-01 18:00:00';
  end_time: string = '2000-01-01 18:00:00';
  /** Minutes between two starts. */
  occurence: number = 5184000;
  /** Minutes it lasts. */
  length: number = 2592000;
  holiday: number = 0;
  holidayStage: number = 0;
  description: string = '';
  world_event: number = 0;
  announce: number = 2;
}
