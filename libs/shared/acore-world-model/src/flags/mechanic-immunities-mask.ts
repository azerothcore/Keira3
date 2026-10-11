import { Flag } from '@keira/shared/constants';

/**
 * `creature_immunities.MechanicsMask` bitmask.
 *
 * Bit N is the core `Mechanics` id N: bit 1 is `MECHANIC_CHARM` … bit 31 `MECHANIC_ENRAGED`, then the
 * post-`ENRAGED` ids up to bit 36 (`MECHANIC_TAUNTED`).
 *
 * NOTE: this is NOT `MECHANIC_IMMUNE_MASK`, which uses the obsolete pre-migration numbering (its bit 0 is
 * `CHARM`); using that list for this column would display and write immunity to the wrong mechanics.
 */
export const MECHANIC_IMMUNITIES_MASK: Flag[] = [
  { bit: 1, name: 'CHARM' },
  { bit: 2, name: 'DISORIENTED' },
  { bit: 3, name: 'DISARM' },
  { bit: 4, name: 'DISTRACT' },
  { bit: 5, name: 'FEAR' },
  { bit: 6, name: 'GRIP - Death Grip and similar effects' },
  { bit: 7, name: 'ROOT' },
  { bit: 8, name: 'SLOW_ATTACK' },
  { bit: 9, name: 'SILENCE' },
  { bit: 10, name: 'SLEEP' },
  { bit: 11, name: 'SNARE' },
  { bit: 12, name: 'STUN' },
  { bit: 13, name: 'FREEZE' },
  { bit: 14, name: 'KNOCKOUT - Incapacitate effects such as Repentance (Paladin)' },
  { bit: 15, name: 'BLEED' },
  { bit: 16, name: 'BANDAGE - Healing' },
  { bit: 17, name: 'POLYMORPH' },
  { bit: 18, name: 'BANISH' },
  { bit: 19, name: 'SHIELD' },
  { bit: 20, name: 'SHACKLE - Shackle Undead only' },
  { bit: 21, name: 'MOUNT - Any effect that summons a mount' },
  { bit: 22, name: 'INFECTED - e.g. Frost Fever, Blood Plague etc..' },
  { bit: 23, name: 'TURN - e.g. Turn Evil' },
  { bit: 24, name: 'HORROR - e.g. Death Coil (Warlock)' },
  { bit: 25, name: 'INVULNERABILITY - Forbearance, Nether Protection, Diplomatic Immunity only' },
  { bit: 26, name: 'INTERRUPT' },
  { bit: 27, name: 'DAZE' },
  { bit: 28, name: 'DISCOVERY - Any Create Item effect' },
  { bit: 29, name: 'IMMUNE_SHIELD - e.g. Divine Shield, Ice Block, Hand of Protection' },
  { bit: 30, name: 'SAPPED' },
  { bit: 31, name: 'ENRAGED' },
  { bit: 32, name: 'WOUNDED' },
  { bit: 33, name: 'INFECTED_2' },
  { bit: 34, name: 'INFECTED_3' },
  { bit: 35, name: 'INFECTED_4' },
  { bit: 36, name: 'TAUNTED' },
];
