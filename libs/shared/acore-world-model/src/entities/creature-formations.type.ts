import { TableRow } from '@keira/shared/constants';

export const CREATURE_FORMATIONS_TABLE = 'creature_formations';
export const CREATURE_FORMATIONS_MEMBER_GUID = 'memberGUID';
export const CREATURE_FORMATIONS_LEADER_GUID = 'leaderGUID';

export class CreatureFormations extends TableRow {
  leaderGuid: number = 0;
  memberGuid: number = 0;
  dist: number = 0;
  angle: number = 0;
  groupAI: number = 0;
  point_1: number = 0;
  point_2: number = 0;
}
