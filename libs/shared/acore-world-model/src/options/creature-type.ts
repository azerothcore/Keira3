import { Option } from '@keira/shared/constants';

export const CREATURE_TYPE: Option[] = [
  { value: 0, name: 'NONE' },
  { value: 1, name: 'BEAST' },
  { value: 2, name: 'DRAGONKIN' },
  { value: 3, name: 'DEMON' },
  { value: 4, name: 'ELEMENTAL' },
  { value: 5, name: 'GIANT' },
  { value: 6, name: 'UNDEAD' },
  { value: 7, name: 'HUMANOID' },
  { value: 8, name: 'CRITTER' },
  { value: 9, name: 'MECHANICAL (cannot be healed by healing spells)' },
  { value: 10, name: 'NOT_SPECIFIED' },
  { value: 11, name: 'TOTEM' },
  { value: 12, name: 'NON_COMBAT_PET' },
  { value: 13, name: 'GAS_CLOUD' },
];
