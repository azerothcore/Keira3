import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_CREATURE_TABLE = 'game_event_creature';
export const GAME_EVENT_CREATURE_ID = 'eventEntry';
export const GAME_EVENT_CREATURE_ID_2 = 'guid';

export class GameEventCreature extends TableRow {
  eventEntry: number = 0;
  guid: number = 0;
}
