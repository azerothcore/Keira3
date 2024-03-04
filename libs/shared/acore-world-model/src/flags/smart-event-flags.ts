import { Flag } from '@keira/shared-constants';

export const SMART_EVENT_FLAGS: Flag[] = [
  { bit: 0, name: 'NOT_REPEATABLE (Event can not repeat)' },
  { bit: 1, name: 'DIFFICULTY_0 (Normal dungeon)' },
  { bit: 2, name: 'DIFFICULTY_1 (Heroic dungeon)' },
  { bit: 3, name: 'DIFFICULTY_2 (Normal raid)' },
  { bit: 4, name: 'DIFFICULTY_3 (Heroic raid)' },
  { bit: 5, name: 'RESERVED_5 (not used)' },
  { bit: 6, name: 'RESERVED_6 (not used)' },
  { bit: 7, name: 'DEBUG_ONLY (only used in debug build)' },
  { bit: 8, name: 'DONT_RESET (Event will not reset)' },
  { bit: 9, name: 'WHILE_CHARMED (AI owner is charmed)' },
];
