import { Option } from '../../types/general';

export const ITEM_CLASS: Option[] = [
  { value: 0,   name: 'Consumable' },
  { value: 1,   name: 'Container' },
  { value: 2,   name: 'Weapon' },
  { value: 3,   name: 'Gem' },
  { value: 4,   name: 'Armor' },
  { value: 5,   name: 'Reagent' },
  { value: 6,   name: 'Projectile' },
  { value: 7,   name: 'Trade Goods' },
  { value: 8,   name: 'Generic(OBSOLETE)' },
  { value: 9,   name: 'Recipe' },
  { value: 0,   name: 'Money(OBSOLETE)' },
  { value: 11,  name: 'Quiver' },
  { value: 12,  name: 'Quest' },
  { value: 13,  name: 'Key' },
  { value: 14,  name: 'Permanent(OBSOLETE)' },
  { value: 15,  name: 'Miscellaneous' },
  { value: 16,  name: 'Glyph' },
];

export const ITEM_SUBCLASS: Option[][] = [];

ITEM_SUBCLASS[0] = [
  { value: 0,   name: 'Consumable (usability in combat depends on the assigned spell)' },
  { value: 1,   name: 'Potion' },
  { value: 2,   name: 'Elixir' },
  { value: 3,   name: 'Flask' },
  { value: 4,   name: 'Scroll' },
  { value: 5,   name: 'Food &amp; Drink' },
  { value: 6,   name: 'Item Enhancement' },
  { value: 7,   name: 'Bandage' },
  { value: 8,   name: 'Other' },
];

ITEM_SUBCLASS[1] = [
  { value: 0,   name: 'Bag' },
  { value: 1,   name: 'Soul Bag' },
  { value: 2,   name: 'Herb Bag' },
  { value: 3,   name: 'Enchanting Bag' },
  { value: 4,   name: 'Engineering Bag' },
  { value: 5,   name: 'Gem Bag' },
  { value: 6,   name: 'Mining Bag' },
  { value: 7,   name: 'Leatherworking Bag' },
  { value: 8,   name: 'Inscription Bag' },
];

ITEM_SUBCLASS[2] = [
  { value: 0,   name: 'Axe (One-handed)' },
  { value: 1,   name: 'Axe (Two-handed)' },
  { value: 2,   name: 'Bow' },
  { value: 3,   name: 'Gun' },
  { value: 4,   name: 'Mace (One-handed)' },
  { value: 5,   name: 'Mace (Two-handed)' },
  { value: 6,   name: 'Polearm' },
  { value: 7,   name: 'Sword (One-handed)' },
  { value: 8,   name: 'Sword (Two-handed)' },
  { value: 9,   name: 'Obsolete' },
  { value: 10,  name: 'Staff' },
  { value: 11,  name: 'Exotic' },
  { value: 12,  name: 'Exotic' },
  { value: 13,  name: 'Fist Weapon' },
  { value: 14,  name: 'Miscellaneous (Blacksmith Hammer, Mining Pick, etc.)' },
  { value: 15,  name: 'Dagger' },
  { value: 16,  name: 'Thrown' },
  { value: 17,  name: 'Spear' },
  { value: 18,  name: 'Crossbow' },
  { value: 19,  name: 'Wand' },
  { value: 20,  name: 'Fishing Pole' },
];

ITEM_SUBCLASS[3] = [
  { value: 0,   name: 'Red' },
  { value: 1,   name: 'Blue' },
  { value: 2,   name: 'Yellow' },
  { value: 3,   name: 'Purple' },
  { value: 4,   name: 'Green' },
  { value: 5,   name: 'Orange' },
  { value: 6,   name: 'Meta' },
  { value: 7,   name: 'Simple' },
  { value: 8,   name: 'Prismatic' },
];

ITEM_SUBCLASS[4] = [
  { value: 0,   name: 'Miscellaneous' },
  { value: 1,   name: 'Cloth' },
  { value: 2,   name: 'Leather' },
  { value: 3,   name: 'Mail' },
  { value: 4,   name: 'Plate' },
  { value: 5,   name: 'Buckler(OBSOLETE)' },
  { value: 6,   name: 'Shield' },
  { value: 7,   name: 'Libram' },
  { value: 8,   name: 'Idol' },
  { value: 9,   name: 'Totem' },
  { value: 10,  name: 'Sigil' },
];

ITEM_SUBCLASS[5] = [
  { value: 0,   name: 'Reagent' },
];

ITEM_SUBCLASS[6] = [
  { value: 0,   name: 'Wand(OBSOLETE)' },
  { value: 1,   name: 'Bolt(OBSOLETE)' },
  { value: 2,   name: 'Arrow' },
  { value: 3,   name: 'Bullet' },
  { value: 4,   name: 'Thrown(OBSOLETE)' },
];

ITEM_SUBCLASS[7] = [
  { value: 0,   name: 'xxxx' },
  { value: 1,   name: 'xxxx' },
  { value: 2,   name: 'xxxx' },
  { value: 3,   name: 'xxxx' },
  { value: 4,   name: 'xxxx' },
  { value: 5,   name: 'xxxx' },
  { value: 6,   name: 'xxxx' },
  { value: 7,   name: 'xxxx' },
  { value: 8,   name: 'xxxx' },
];

ITEM_SUBCLASS[8] = [
  { value: 0,   name: 'Generic(OBSOLETE)' },
];

ITEM_SUBCLASS[9] = [
  { value: 0,   name: 'xxxx' },
  { value: 1,   name: 'xxxx' },
  { value: 2,   name: 'xxxx' },
  { value: 3,   name: 'xxxx' },
  { value: 4,   name: 'xxxx' },
  { value: 5,   name: 'xxxx' },
  { value: 6,   name: 'xxxx' },
  { value: 7,   name: 'xxxx' },
  { value: 8,   name: 'xxxx' },
];

ITEM_SUBCLASS[10] = [
  { value: 0,   name: 'Money(OBSOLETE)' },
];

ITEM_SUBCLASS[11] = [
  { value: 0,   name: 'xxxx' },
  { value: 1,   name: 'xxxx' },
  { value: 2,   name: 'xxxx' },
  { value: 3,   name: 'xxxx' },
  { value: 4,   name: 'xxxx' },
  { value: 5,   name: 'xxxx' },
  { value: 6,   name: 'xxxx' },
  { value: 7,   name: 'xxxx' },
  { value: 8,   name: 'xxxx' },
];

ITEM_SUBCLASS[12] = [
  { value: 0,   name: 'Quest' },
];

ITEM_SUBCLASS[13] = [
  { value: 0,   name: 'xxxx' },
  { value: 1,   name: 'xxxx' },
  { value: 2,   name: 'xxxx' },
  { value: 3,   name: 'xxxx' },
  { value: 4,   name: 'xxxx' },
  { value: 5,   name: 'xxxx' },
  { value: 6,   name: 'xxxx' },
  { value: 7,   name: 'xxxx' },
  { value: 8,   name: 'xxxx' },
];

ITEM_SUBCLASS[14] = [
  { value: 0,   name: 'Permanent' },
];

ITEM_SUBCLASS[15] = [
  { value: 0,   name: 'xxxx' },
  { value: 1,   name: 'xxxx' },
  { value: 2,   name: 'xxxx' },
  { value: 3,   name: 'xxxx' },
  { value: 4,   name: 'xxxx' },
  { value: 5,   name: 'xxxx' },
  { value: 6,   name: 'xxxx' },
  { value: 7,   name: 'xxxx' },
  { value: 8,   name: 'xxxx' },
];

ITEM_SUBCLASS[16] = [
  { value: 0,   name: 'xxxx' },
  { value: 1,   name: 'xxxx' },
  { value: 2,   name: 'xxxx' },
  { value: 3,   name: 'xxxx' },
  { value: 4,   name: 'xxxx' },
  { value: 5,   name: 'xxxx' },
  { value: 6,   name: 'xxxx' },
  { value: 7,   name: 'xxxx' },
  { value: 8,   name: 'xxxx' },
];
