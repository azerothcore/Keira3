import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_NPCFLAG_TABLE = 'game_event_npcflag';
export const GAME_EVENT_NPCFLAG_ID = 'eventEntry';
export const GAME_EVENT_NPCFLAG_ID_2 = 'guid';

export class GameEventNpcflag extends TableRow {
  eventEntry: number = 0;
  guid: number = 0;
  npcflag: number = 0;
}
