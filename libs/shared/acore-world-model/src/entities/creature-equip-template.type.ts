import { TableRow } from '../../../shared-constants/src/types/general';

export const CREATURE_EQUIP_TEMPLATE_TABLE = 'creature_equip_template';
export const CREATURE_EQUIP_TEMPLATE_ID = 'CreatureID';

export class CreatureEquipTemplate extends TableRow {
  CreatureID: number = 0;
  ID: number = 1;
  ItemID1: number = 0;
  ItemID2: number = 0;
  ItemID3: number = 0;
  VerifiedBuild: number = 0;
}
