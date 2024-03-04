import { TableRow } from '../../../shared-constants/src/types/general';

export const CREATURE_TEMPLATE_RESISTANCE_TABLE = 'creature_template_resistance';
export const CREATURE_TEMPLATE_RESISTANCE_ID = 'CreatureID';
export const CREATURE_TEMPLATE_RESISTANCE_ID_2 = 'School';

export class CreatureTemplateResistance extends TableRow {
  CreatureID: number = 0;
  School: number = 1;
  Resistance: number = 0;
  VerifiedBuild: number = 0;
}
