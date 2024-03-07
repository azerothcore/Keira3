import { TableRow } from '@keira/shared/constants';

export const CREATURE_TEMPLATE_SPELL_TABLE = 'creature_template_spell';
export const CREATURE_TEMPLATE_SPELL_ID = 'CreatureID';
export const CREATURE_TEMPLATE_SPELL_ID_2 = 'Index';

export class CreatureTemplateSpell extends TableRow {
  CreatureID: number = 0;
  Index: number = 0;
  Spell: number = 0;
  VerifiedBuild: number = 0;
}
