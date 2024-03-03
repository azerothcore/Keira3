import { TableRow } from '../../../keira-shared-constants/src/types/general';

export const GAMEOBJECT_TEMPLATE_ADDON_TABLE = 'gameobject_template_addon';
export const GAMEOBJECT_TEMPLATE_ADDON_ID = 'entry';

export class GameobjectTemplateAddon extends TableRow {
  entry: number = 0;
  faction: number = 0;
  flags: number = 0;
  mingold: number = 0;
  maxgold: number = 0;
  artkit0: number = 0;
  artkit1: number = 0;
  artkit2: number = 0;
  artkit3: number = 0;
}
