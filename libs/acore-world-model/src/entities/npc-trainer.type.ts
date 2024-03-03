import { TableRow } from '../../../keira-shared-constants/src/types/general';

export const NPC_TRAINER_TABLE = 'npc_trainer';
export const NPC_TRAINER_ID = 'ID';
export const NPC_TRAINER_ID_2 = 'SpellID';

export class NpcTrainer extends TableRow {
  ID: number = 0;
  SpellID: number = 0;
  MoneyCost: number = 0;
  ReqSkillLine: number = 0;
  ReqSkillRank: number = 0;
  ReqLevel: number = 0;
}
