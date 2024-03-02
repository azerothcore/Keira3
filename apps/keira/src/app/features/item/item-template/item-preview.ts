import { ITEM_MOD } from '@keira-shared/constants/options/item-class';
import { TableRow } from '@keira/acore-world-model';

export class Lock extends TableRow {
  id: number;
  type1: number;
  type2: number;
  type3: number;
  type4: number;
  type5: number;
  properties1: number;
  properties2: number;
  properties3: number;
  properties4: number;
  properties5: number;
  reqSkill1: number;
  reqSkill2: number;
  reqSkill3: number;
  reqSkill4: number;
  reqSkill5: number;
}

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

export const gtCombatRatings = {
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

export const enum CLASSES {
  WARRIOR = 0x001,
  PALADIN = 0x002,
  HUNTER = 0x004,
  ROGUE = 0x008,
  PRIEST = 0x010,
  DEATHKNIGHT = 0x020,
  SHAMAN = 0x040,
  MAGE = 0x080,
  WARLOCK = 0x100,
  DRUID = 0x400,
  MASK_ALL = 0x5ff,
}

export const enum RACE {
  HUMAN = 0x001,
  ORC = 0x002,
  DWARF = 0x004,
  NIGHTELF = 0x008,
  UNDEAD = 0x010,
  TAUREN = 0x020,
  GNOME = 0x040,
  TROLL = 0x080,
  BLOODELF = 0x200,
  DRAENEI = 0x400,
  MASK_ALLIANCE = 0x44d,
  MASK_HORDE = 0x2b2,
  MASK_ALL = 0x6ff,
}
