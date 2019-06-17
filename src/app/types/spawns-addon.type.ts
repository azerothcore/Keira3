import { TableRow } from './general';

export const SPAWNS_ADDON_TABLE = 'creature_addon';
export const SPAWNS_ADDON_ID_2 = 'guid';

export class SpawnsAddon extends TableRow {
  guid: number = 0;
  path_id: number = 0;
  mount: number = 0;
  bytes1: number = 0;
  bytes2: number = 0;
  emote: number = 0;
  auras: string = '';
}
