import { TableRow } from './general';

export const NPC_VENDOR_TABLE = 'npc_vendor';
export const NPC_VENDOR_ID = 'entry';
export const NPC_VENDOR_ID_2 = 'item';

export class NpcVendor extends TableRow {
  entry: number = 0;
  slot: number = 0;
  item: number = 0;
  maxcount: number = 0;
  incrtime: number = 0;
  ExtendedCost: number = 0;
  VerifiedBuild: number = 0;
}
