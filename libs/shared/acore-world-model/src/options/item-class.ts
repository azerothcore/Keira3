import { Option } from '@keira/shared-constants';

export const ITEM_CLASS: Option[] = [
  { value: 0, name: 'Consumable' },
  { value: 1, name: 'Container' },
  { value: 2, name: 'Weapon' },
  { value: 3, name: 'Gem' },
  { value: 4, name: 'Armor' },
  { value: 5, name: 'Reagent' },
  { value: 6, name: 'Projectile' },
  { value: 7, name: 'Trade Goods' },
  { value: 8, name: 'Generic', comment: 'OBSOLETE' },
  { value: 9, name: 'Recipe' },
  { value: 0, name: 'Money', comment: 'OBSOLETE' },
  { value: 11, name: 'Quiver' },
  { value: 12, name: 'Quest' },
  { value: 13, name: 'Key' },
  { value: 14, name: 'Permanent', comment: 'OBSOLETE' },
  { value: 15, name: 'Miscellaneous' },
  { value: 16, name: 'Glyph' },
];

export const ITEM_SUBCLASS: Option[][] = [];

ITEM_SUBCLASS[0] = [
  { value: 0, name: 'Consumable', comment: 'usability in combat depends on the assigned spell' },
  { value: 1, name: 'Potion' },
  { value: 2, name: 'Elixir' },
  { value: 3, name: 'Flask' },
  { value: 4, name: 'Scroll' },
  { value: 5, name: 'Food &amp; Drink' },
  { value: 6, name: 'Item Enhancement' },
  { value: 7, name: 'Bandage' },
  { value: 8, name: 'Other' },
];

ITEM_SUBCLASS[1] = [
  { value: 0, name: 'Bag' },
  { value: 1, name: 'Soul Bag' },
  { value: 2, name: 'Herb Bag' },
  { value: 3, name: 'Enchanting Bag' },
  { value: 4, name: 'Engineering Bag' },
  { value: 5, name: 'Gem Bag' },
  { value: 6, name: 'Mining Bag' },
  { value: 7, name: 'Leatherworking Bag' },
  { value: 8, name: 'Inscription Bag' },
];

ITEM_SUBCLASS[2] = [
  { value: 0, name: 'Axe', comment: 'One-handed' },
  { value: 1, name: 'Axe', comment: 'Two-handed' },
  { value: 2, name: 'Bow' },
  { value: 3, name: 'Gun' },
  { value: 4, name: 'Mace', comment: 'One-handed' },
  { value: 5, name: 'Mace', comment: 'Two-handed' },
  { value: 6, name: 'Polearm' },
  { value: 7, name: 'Sword', comment: 'One-handed' },
  { value: 8, name: 'Sword', comment: 'Two-handed' },
  { value: 9, name: 'Obsolete' },
  { value: 10, name: 'Staff' },
  { value: 11, name: 'Exotic' },
  { value: 12, name: 'Exotic' },
  { value: 13, name: 'Fist Weapon' },
  { value: 14, name: 'Miscellaneous', comment: 'Blacksmith Hammer, Mining Pick, etc.' },
  { value: 15, name: 'Dagger' },
  { value: 16, name: 'Thrown' },
  { value: 17, name: 'Spear' },
  { value: 18, name: 'Crossbow' },
  { value: 19, name: 'Wand' },
  { value: 20, name: 'Fishing Pole' },
];

ITEM_SUBCLASS[3] = [
  { value: 0, name: 'Red' },
  { value: 1, name: 'Blue' },
  { value: 2, name: 'Yellow' },
  { value: 3, name: 'Purple' },
  { value: 4, name: 'Green' },
  { value: 5, name: 'Orange' },
  { value: 6, name: 'Meta' },
  { value: 7, name: 'Simple' },
  { value: 8, name: 'Prismatic' },
];

ITEM_SUBCLASS[4] = [
  { value: 0, name: 'Miscellaneous' },
  { value: 1, name: 'Cloth' },
  { value: 2, name: 'Leather' },
  { value: 3, name: 'Mail' },
  { value: 4, name: 'Plate' },
  { value: 5, name: 'Buckler', comment: 'OBSOLETE' },
  { value: 6, name: 'Shield' },
  { value: 7, name: 'Libram' },
  { value: 8, name: 'Idol' },
  { value: 9, name: 'Totem' },
  { value: 10, name: 'Sigil' },
];

ITEM_SUBCLASS[5] = [{ value: 0, name: 'Reagent' }];

ITEM_SUBCLASS[6] = [
  { value: 0, name: 'Wand', comment: 'OBSOLETE' },
  { value: 1, name: 'Bolt', comment: 'OBSOLETE' },
  { value: 2, name: 'Arrow' },
  { value: 3, name: 'Bullet' },
  { value: 4, name: 'Thrown', comment: 'OBSOLETE' },
];

ITEM_SUBCLASS[7] = [
  { value: 0, name: 'Trade Goods' },
  { value: 1, name: 'Parts' },
  { value: 2, name: 'Explosives' },
  { value: 3, name: 'Devices' },
  { value: 4, name: 'Jewelcrafting' },
  { value: 5, name: 'Cloth' },
  { value: 6, name: 'Leather' },
  { value: 7, name: 'Metal &amp; Stone' },
  { value: 8, name: 'Meat' },
  { value: 9, name: 'Herb' },
  { value: 10, name: 'Elemental' },
  { value: 11, name: 'Other' },
  { value: 12, name: 'Enchanting' },
  { value: 13, name: 'Materials' },
  { value: 14, name: 'Armor Enchantment' },
  { value: 15, name: 'Weapon Enchantment' },
];

ITEM_SUBCLASS[8] = [{ value: 0, name: 'Generic', comment: 'OBSOLETE' }];

ITEM_SUBCLASS[9] = [
  { value: 0, name: 'Book' },
  { value: 1, name: 'Leatherworking' },
  { value: 2, name: 'Tailoring' },
  { value: 3, name: 'Engineering' },
  { value: 4, name: 'Blacksmithing' },
  { value: 5, name: 'Cooking' },
  { value: 6, name: 'Alchemy' },
  { value: 7, name: 'First Aid' },
  { value: 8, name: 'Enchanting' },
  { value: 9, name: 'Fishing' },
  { value: 10, name: 'Jewelcrafting' },
];

ITEM_SUBCLASS[10] = [{ value: 0, name: 'Money', comment: 'OBSOLETE' }];

ITEM_SUBCLASS[11] = [
  { value: 0, name: 'Quiver (OBSOLETE)' },
  { value: 1, name: 'Quiver (OBSOLETE)' },
  { value: 2, name: 'Quiver', comment: '(Can hold arrows)' },
  { value: 3, name: 'Ammo Pouch', comment: 'Can hold bullets' },
];

ITEM_SUBCLASS[12] = [{ value: 0, name: 'Quest' }];

ITEM_SUBCLASS[13] = [
  { value: 0, name: 'Key' },
  { value: 1, name: 'Lockpick' },
];

ITEM_SUBCLASS[14] = [{ value: 0, name: 'Permanent' }];

ITEM_SUBCLASS[15] = [
  { value: 0, name: 'Junk' },
  { value: 1, name: 'Reagent' },
  { value: 2, name: 'Pet' },
  { value: 3, name: 'Holiday' },
  { value: 4, name: 'Other' },
  { value: 5, name: 'Mount' },
];

ITEM_SUBCLASS[16] = [
  { value: 1, name: 'Warrior' },
  { value: 2, name: 'Paladin' },
  { value: 3, name: 'Hunter' },
  { value: 4, name: 'Rogue' },
  { value: 5, name: 'Priest' },
  { value: 6, name: 'Death Knight' },
  { value: 7, name: 'Shaman' },
  { value: 8, name: 'Mage' },
  { value: 9, name: 'Warlock' },
  { value: 11, name: 'Druid' },
];

export const enum ITEM_TYPE {
  CONTAINER = 1,
  WEAPON = 2,
  ARMOR = 4,
  AMMUNITION = 6,
}

// ItemMod  (differ slightly from client, see g_statToJson)
export const enum ITEM_MOD {
  MANA = 0,
  HEALTH = 1,
  AGILITY = 3, // stats v
  STRENGTH = 4,
  INTELLECT = 5,
  SPIRIT = 6,
  STAMINA = 7,
  ENERGY = 8, // powers v
  RAGE = 9,
  FOCUS = 10,
  RUNIC_POWER = 11,
  DEFENSE_SKILL_RATING = 12, // ratings v
  DODGE_RATING = 13,
  PARRY_RATING = 14,
  BLOCK_RATING = 15,
  HIT_MELEE_RATING = 16,
  HIT_RANGED_RATING = 17,
  HIT_SPELL_RATING = 18,
  CRIT_MELEE_RATING = 19,
  CRIT_RANGED_RATING = 20,
  CRIT_SPELL_RATING = 21,
  HIT_TAKEN_MELEE_RATING = 22,
  HIT_TAKEN_RANGED_RATING = 23,
  HIT_TAKEN_SPELL_RATING = 24,
  CRIT_TAKEN_MELEE_RATING = 25,
  CRIT_TAKEN_RANGED_RATING = 26,
  CRIT_TAKEN_SPELL_RATING = 27,
  HASTE_MELEE_RATING = 28,
  HASTE_RANGED_RATING = 29,
  HASTE_SPELL_RATING = 30,
  HIT_RATING = 31,
  CRIT_RATING = 32,
  HIT_TAKEN_RATING = 33,
  CRIT_TAKEN_RATING = 34,
  RESILIENCE_RATING = 35,
  HASTE_RATING = 36,
  EXPERTISE_RATING = 37,
  ATTACK_POWER = 38,
  RANGED_ATTACK_POWER = 39,
  FERAL_ATTACK_POWER = 40,
  SPELL_HEALING_DONE = 41, // deprecated
  SPELL_DAMAGE_DONE = 42, // deprecated
  MANA_REGENERATION = 43,
  ARMOR_PENETRATION_RATING = 44,
  SPELL_POWER = 45,
  HEALTH_REGEN = 46,
  SPELL_PENETRATION = 47,
  BLOCK_VALUE = 48,
  // MASTERY_RATING           = 49,
  ARMOR = 50, // resistances v
  FIRE_RESISTANCE = 51,
  FROST_RESISTANCE = 52,
  HOLY_RESISTANCE = 53,
  SHADOW_RESISTANCE = 54,
  NATURE_RESISTANCE = 55,
  ARCANE_RESISTANCE = 56, // custom v
  FIRE_POWER = 57,
  FROST_POWER = 58,
  HOLY_POWER = 59,
  SHADOW_POWER = 60,
  NATURE_POWER = 61,
  ARCANE_POWER = 62,
}

// ItemClass
export const ITEM_CLASS_RECIPE = 9;
