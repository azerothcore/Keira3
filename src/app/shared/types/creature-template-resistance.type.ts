import { TableRow } from './general';

export const CREATURE_TEMPLATE_RESISTANCE_TABLE = 'creature_template_resistance';
export const CREATURE_TEMPLATE_RESISTANCE_ID = 'creatureid';
export const CREATURE_TEMPLATE_SCHOOL = 'school';

export class CreatureTemplateResistance extends TableRow {
  creatureid: number = 0;
  school: number = 0;
  resistance: number = 0;
  verifiedbuild: number = 0;
}
