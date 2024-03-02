import { Flag } from '@keira/acore-world-model';

export const ITEM_FLAGS_EXTRA: Flag[] = [
  { bit: 0, name: 'HORDE_ONLY' },
  { bit: 1, name: 'ALLIANCE_ONLY' },
  { bit: 2, name: 'EXT_COST_REQUIRES_GOLD' },
  { bit: 4, name: 'NEED_ROLL_DISABLED' },
];
