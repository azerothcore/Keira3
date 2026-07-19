import { TableRow } from '@keira/shared/constants';

export const TRAINER_SPELL_TABLE = 'trainer_spell';
export const TRAINER_SPELL_ID = 'TrainerId';
export const TRAINER_SPELL_ID_2 = 'SpellId';

export class TrainerSpell extends TableRow {
  TrainerId: number = 0;
  SpellId: number = 0;
  MoneyCost: number = 0;
  ReqSkillLine: number = 0;
  ReqSkillRank: number = 0;
  ReqAbility1: number = 0;
  ReqAbility2: number = 0;
  ReqAbility3: number = 0;
  ReqLevel: number = 0;
  VerifiedBuild: number = 0;
}
