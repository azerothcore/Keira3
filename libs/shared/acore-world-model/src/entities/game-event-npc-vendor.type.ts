import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_NPC_VENDOR_TABLE = 'game_event_npc_vendor';
export const GAME_EVENT_NPC_VENDOR_ID = 'eventEntry';
export const GAME_EVENT_NPC_VENDOR_ID_2 = 'guid';
export const GAME_EVENT_NPC_VENDOR_ID_3 = 'item';

export class GameEventNpcVendor extends TableRow {
  eventEntry: number = 0;
  guid: number = 0;
  item: number = 0;
  slot: number = 0;
  maxcount: number = 0;
  incrtime: number = 0;
  ExtendedCost: number = 0;
}
