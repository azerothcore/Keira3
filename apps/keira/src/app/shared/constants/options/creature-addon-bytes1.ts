import { Option } from '@keira/acore-world-model';

// TODO: not all possible values are listed here

export const CREATURE_ADDON_BYTES_1: Option[] = [
  { value: 0, name: 'None' },
  { value: 1, name: 'Sitting' },
  { value: 2, name: 'Sit chair' },
  { value: 3, name: 'Sleep' },
  { value: 4, name: 'Sit low chair' },
  { value: 5, name: 'Sit medium chair' },
  { value: 6, name: 'Sit high chair' },
  { value: 7, name: 'Shows health bar as empty (combine with the state dead emote to make a creature look dead)' },
  { value: 8, name: 'Makes the mob kneel' },
  { value: 9, name: 'Submerges the creature below the ground' },
  { value: 54432, name: 'Hover mode' },
  { value: 50331648, name: 'Hover mode 2' },
];
