import { TableRow } from './general';

export const GAMEOBJECT_TEMPLATE_ADDON_TABLE = 'gameobject_template_addon';
export const GAMEOBJECT_TEMPLATE_ADDON_ID = 'entry';

export class GameobjectTemplateAddon extends TableRow {
  entry: number = 0;
  faction: number = 0;
  flags: number = 0;
  mingold: number = 0;
  maxgold: number = 0;
}
