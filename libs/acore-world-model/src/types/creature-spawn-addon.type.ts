import { TableRow } from './general';

export const CREATURE_SPAWN_ADDON_TABLE = 'creature_addon';
export const CREATURE_SPAWN_ADDON_ID_2 = 'guid';

export class CreatureSpawnAddon extends TableRow {
  guid: number = 0;
  path_id: number = 0;
  mount: number = 0;
  bytes1: number = 0;
  bytes2: number = 0;
  emote: number = 0;
  visibilityDistanceType: number = 0;
  auras: string = '';
}
