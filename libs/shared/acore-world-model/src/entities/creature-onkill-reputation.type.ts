import { TableRow } from '../../../shared-constants/src/types/general';

export const CREATURE_ONKLL_REPUTATION_TABLE = 'creature_onkill_reputation';
export const CREATURE_ONKLL_REPUTATION_ID = 'creature_id';

export class CreatureOnkillReputation extends TableRow {
  creature_id: number = 0;
  RewOnKillRepFaction1: number = 0;
  RewOnKillRepFaction2: number = 0;
  MaxStanding1: number = 0;
  IsTeamAward1: number = 0;
  RewOnKillRepValue1: number = 0;
  MaxStanding2: number = 0;
  IsTeamAward2: number = 0;
  RewOnKillRepValue2: number = 0;
  TeamDependent: number = 0;
}
