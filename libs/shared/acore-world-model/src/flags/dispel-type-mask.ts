import { Flag } from '@keira/shared/constants';

/**
 * `creature_immunities.DispelTypeMask` bitmask.
 *
 * Bit N is the core `DispelType` id N, so bit 1 is `DISPEL_MAGIC` … bit 11 is `DISPEL_ZZOLD_UNUSED`.
 * Bit 0 (`DISPEL_NONE`) is intentionally not offered: the core only consults the dispel check when the
 * spell's dispel type is non-zero, so the bit is inert.
 */
export const DISPEL_TYPE_MASK: Flag[] = [
  { bit: 1, name: 'Magic' },
  { bit: 2, name: 'Curse' },
  { bit: 3, name: 'Disease' },
  { bit: 4, name: 'Poison' },
  { bit: 5, name: 'Stealth' },
  { bit: 6, name: 'Invisibility' },
  { bit: 7, name: 'All(M+C+D+P)' },
  { bit: 8, name: 'Special - npc only' },
  { bit: 9, name: 'Enrage' },
  { bit: 10, name: 'ZG Trinkets' },
  { bit: 11, name: 'ZZOLD UNUSED' },
];
