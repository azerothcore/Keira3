import { Flag } from '../../types/general';

export const QUEST_STATE: Flag[] = [
  { bit: 0, name: 'NONE (not taken)' },
  { bit: 1, name: 'COMPLETE' },
  { bit: 2, name: 'UNAVAILABLE (unused)' },
  { bit: 3, name: 'INCOMPLETE (in progress)' },
  { bit: 4, name: 'AVAILABLE (unused)' },
  { bit: 5, name: 'FAILED' },
  { bit: 6, name: 'REWARDED' },
];

export const RANKMASK: Flag[] = [
  { bit: 0, name: 'HATED' },
  { bit: 1, name: 'HOSTILE' },
  { bit: 2, name: 'UNFRIENDLY' },
  { bit: 3, name: 'NEUTRAL' },
  { bit: 4, name: 'FRIENDLY' },
  { bit: 5, name: 'HONORED' },
  { bit: 6, name: 'REVERED' },
  { bit: 7, name: 'EXALTED' },
];

export const TYPEMASK: Flag[] = [
  { bit: 3, name: 'TYPEMASK_UNIT' },
  { bit: 4, name: 'TYPEMASK_PLAYER' },
  { bit: 5, name: 'TYPEMASK_GAMEOBJECT' },
  { bit: 7, name: 'TYPEMASK_CORPSE (after spirit release)' },
];
