import { Option } from '@keira/shared/constants';

export const UNIT_CLASS: Option[] = [
  { value: 1, name: 'WARRIOR - Health only (equal to ROGUE)' },
  { value: 2, name: 'PALADIN - health & mana (more health than MAGE but less mana)' },
  { value: 4, name: 'ROGUE - Health only (equal to WARRIOR)' },
  { value: 8, name: 'MAGE - Health & mana (less health than PALADIN but more mana)' },
];
