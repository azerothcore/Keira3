import { TableRow } from '../../../shared-constants/src/types/general';

export const CREATURE_TEMPLATE_ADDON_TABLE = 'creature_template_addon';
export const CREATURE_TEMPLATE_ADDON_ID = 'entry';

export class CreatureTemplateAddon extends TableRow {
  entry: number = 0;
  path_id: number = 0;
  mount: number = 0;
  bytes1: number = 0;
  bytes2: number = 0;
  emote: number = 0;
  visibilityDistanceType: number = 0;
  auras: string = '';
}
