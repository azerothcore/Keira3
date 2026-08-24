import { ITEM_MOD } from '@keira/shared/acore-world-model';

export const MAX_LEVEL = 80;

export const lvlIndepRating = [
  // rating doesn't scale with level
  ITEM_MOD.MANA,
  ITEM_MOD.HEALTH,
  ITEM_MOD.ATTACK_POWER,
  ITEM_MOD.MANA_REGENERATION,
  ITEM_MOD.SPELL_POWER,
  ITEM_MOD.HEALTH_REGEN,
  ITEM_MOD.SPELL_PENETRATION,
  ITEM_MOD.BLOCK_VALUE,
];

export const gtCombatRatings: Record<number, number> = {
  12: 1.5,
  13: 13.8,
  14: 13.8,
  15: 5,
  16: 10,
  17: 10,
  18: 8,
  19: 14,
  20: 14,
  21: 14,
  22: 10,
  23: 10,
  24: 8,
  25: 0,
  26: 0,
  27: 0,
  28: 10,
  29: 10,
  30: 10,
  31: 10,
  32: 14,
  33: 0,
  34: 0,
  35: 28.75,
  36: 10,
  37: 2.5,
  44: 4.26,
};

export const resistanceFields = [
  // null,
  'holy',
  'fire',
  'nature',
  'frost',
  'shadow',
  'arcane',
];
