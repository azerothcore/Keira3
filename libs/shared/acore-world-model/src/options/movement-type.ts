import { Option } from '@keira/shared/constants';

export const MOVEMENT_TYPE: Option[] = [
  { value: 0, name: 'Idle (stay in place)' },
  { value: 1, name: 'Random (in radius)' },
  { value: 2, name: 'Waypoint movement' },
];
