import { Option } from '@keira/shared/constants';

export const UNIT_CLASS: Option[] = [
  { value: 1, name: 'WARRIOR - Health only (equal to ROGUE)', icon: 'class/1.gif' },
  { value: 2, name: 'PALADIN - health & mana (more health than MAGE but less mana)', icon: 'class/2.gif' },
  { value: 4, name: 'ROGUE - Health only (equal to WARRIOR)', icon: 'class/4.gif' },
  { value: 8, name: 'MAGE - Health & mana (less health than PALADIN but more mana)', icon: 'class/8.gif' },
];
