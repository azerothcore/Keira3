import { TableRow } from '@keira/shared/constants';

export const CREATURE_TEMPLATE_MODEL_TABLE = 'creature_template_model';
export const CREATURE_TEMPLATE_MODEL_ID = 'CreatureID';
export const CREATURE_TEMPLATE_MODEL_ID_2 = 'Idx';

export class CreatureTemplateModel extends TableRow {
  CreatureID: number = 0;
  Idx: number = 0;
  CreatureDisplayID: number = 0;
  DisplayScale: number = 1;
  Probability: number = 1;
  VerifiedBuild: number = 0;
}
