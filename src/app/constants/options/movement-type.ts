import { Option } from '../../types/general';

export const MovementType: Option[] = [
  { value: 0, name: 'Idle (stay in place)' },
  { value: 1, name: 'Random (in radius)' },
  { value: 2, name: 'Waypoint movement' },
];
