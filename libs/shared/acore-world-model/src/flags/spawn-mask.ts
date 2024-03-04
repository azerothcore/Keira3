import { Flag } from '@keira/shared-constants';

export const SPAWN_MASK: Flag[] = [
  { bit: 0, name: '10-man-normal (maps withouth heroic mode)' },
  { bit: 1, name: '25-man-normal (or heroics pre 3.2)' },
  { bit: 2, name: '10-man-heroic' },
  { bit: 3, name: '25-man-heroic' },
];
