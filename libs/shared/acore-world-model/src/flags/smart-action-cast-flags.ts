import { Flag } from '@keira/shared/constants';

export const SMART_ACTION_CAST_FLAGS: Flag[] = [
  { bit: 0, name: 'SMARTCAST_INTERRUPT_PREVIOUS - Interrupt any spell casting' },
  { bit: 1, name: 'SMARTCAST_TRIGGERED - Triggered (this makes spell cost zero mana and have no cast time)' },
  { bit: 2, name: 'SMARTCAST_AURA_NOT_PRESENT - Only casts the spell if the target does not have an aura from the spell' },
  { bit: 3, name: 'SMARTCAST_COMBAT_MOVE - Prevent combat movement on cast, allow on fail range, mana, LOS' },
  { bit: 4, name: "SMARTCAST_THREATLIST_NOT_SINGLE - Only cast if the source's threatlist is higher than one. This includes pets" },
  { bit: 5, name: 'SMARTCAST_TARGET_POWER_MANA - Only cast if the target has power type mana' },
  {
    bit: 6,
    name: 'SMARTCAST_ENABLE_COMBAT_MOVE_ON_LOS - Enable combat chase movement when the spell fails due to line-of-sight. Use with SMARTCAST_COMBAT_MOVE.',
  },
  { bit: 7, name: 'SMARTCAST_MAIN_SPELL - Use with SMARTCAST_COMBAT_MOVE to set attack distance based on spell range' },
];
