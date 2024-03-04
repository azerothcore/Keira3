import { Flag } from '@keira/shared/constants';
import { FACTION_RANK } from '../options/faction-rank';

export const QUEST_STATE: Flag[] = [
  { bit: 0, name: 'NONE (not taken)' },
  { bit: 1, name: 'COMPLETE' },
  { bit: 2, name: 'UNAVAILABLE (unused)' },
  { bit: 3, name: 'INCOMPLETE (in progress)' },
  { bit: 4, name: 'AVAILABLE (unused)' },
  { bit: 5, name: 'FAILED' },
  { bit: 6, name: 'REWARDED' },
];

export const RANKMASK: Flag[] = FACTION_RANK.map((option) => ({ bit: option.value as number, name: option.name }));

export const TYPEMASK: Flag[] = [
  { bit: 3, name: 'TYPEMASK_UNIT' },
  { bit: 4, name: 'TYPEMASK_PLAYER' },
  { bit: 5, name: 'TYPEMASK_GAMEOBJECT' },
  { bit: 7, name: 'TYPEMASK_CORPSE (after spirit release)' },
];
