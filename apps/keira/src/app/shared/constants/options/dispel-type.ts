import { Option } from '../../types/general';

export const DISPEL_TYPE: Option[] = [
  { value: 0, name: 'None' },
  { value: 1, name: 'Magic' },
  { value: 2, name: 'Curse' },
  { value: 3, name: 'Disease' },
  { value: 4, name: 'Poison' },
  { value: 5, name: 'Stealth' },
  { value: 6, name: 'Invisibility' },
  { value: 7, name: 'All(M+C+D+P)' },
  { value: 8, name: 'Special - npc only' },
  { value: 9, name: 'Enrage' },
  { value: 10, name: 'ZG Trinkets' },
  { value: 11, name: 'ZZOLD UNUSED' },
];
