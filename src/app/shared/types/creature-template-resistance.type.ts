import { TableRow } from './general';

export const CREATURE_TEMPLATE_RESISTANCE_TABLE = 'creature_template_resistance';
export const CREATURE_TEMPLATE_RESISTANCE_ID = 'CreatureID';
export const CREATURE_TEMPLATE_SCHOOL = 'School';

export class CreatureTemplateResistance extends TableRow {
  CreatureID: number = 0;
  School: number = 0;
  Resistance: number = 0;
  verifiedbuild: number = 0;
}
