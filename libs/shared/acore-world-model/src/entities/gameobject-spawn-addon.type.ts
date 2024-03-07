import { TableRow } from '@keira/shared/constants';

export const GAMEOBJECT_SPAWN_ADDON_TABLE = 'gameobject_addon';
export const GAMEOBJECT_SPAWN_ADDON_ID_2 = 'guid';

export class GameobjectSpawnAddon extends TableRow {
  guid: number = 0;
  invisibilityType: number = 0;
  invisibilityValue: number = 0;
}
