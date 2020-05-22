import { Flag } from '../../types/general';

export const QUEST_STATE: Flag[] = [
  { bit: 0, name: 'NONE (not taken)', },
  { bit: 1, name: 'COMPLETE', },
  { bit: 2, name: 'UNAVAILABLE (unused)', },
  { bit: 3, name: 'INCOMPLETE (in progress)', },
  { bit: 4, name: 'AVAILABLE (unused)', },
  { bit: 5, name: 'FAILED', },
  { bit: 6, name: 'REWARDED', },
];
