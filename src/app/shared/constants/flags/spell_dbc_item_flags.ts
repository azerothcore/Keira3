import { Flag } from '../../types/general';

export const SPELL_DBC_INVENTORY_TYPE: Flag[] = [
  { bit: 0, name: 'HEAD' },
  { bit: 1, name: 'NECK' },
  { bit: 2, name: 'SHOULDERS' },
  { bit: 3, name: 'BODY' },
  { bit: 4, name: 'CHEST' },
  { bit: 5, name: 'WAIST' },
  { bit: 6, name: 'LEGS' },
  { bit: 7, name: 'FEET' },
  { bit: 8, name: 'WRISTS' },
  { bit: 9, name: 'HANDS' },
  { bit: 10, name: 'FINGER' },
  { bit: 11, name: 'TRINKET' },
  { bit: 12, name: 'WEAPON' },
  { bit: 13, name: 'SHIELD' },
  { bit: 14, name: 'RANGED' },
  { bit: 15, name: 'CLOAK' },
  { bit: 16, name: '2HWEAPON' },
  { bit: 17, name: 'BAG' },
  { bit: 18, name: 'TABARD' },
  { bit: 19, name: 'ROBE' },
  { bit: 20, name: 'WEAPONMAINHAND' },
  { bit: 21, name: 'WEAPONOFFHAND' },
  { bit: 22, name: 'HOLDABL' },
  { bit: 23, name: 'AMMO' },
  { bit: 24, name: 'THROWN' },
  { bit: 25, name: 'RANGEDRIGHT' },
  { bit: 26, name: 'QUIVER' },
  { bit: 27, name: 'RELIC' },
];

export const SPELL_DBC_ITEM_SUBCLASS: Flag[][] = [];

SPELL_DBC_ITEM_SUBCLASS[0] = [
  { bit: 0, name: 'Consumable' },
  { bit: 1, name: 'Potion' },
  { bit: 2, name: 'Elixir' },
  { bit: 3, name: 'Flask' },
  { bit: 4, name: 'Scroll' },
  { bit: 5, name: 'Food &amp; Drink' },
  { bit: 6, name: 'Item Enhancement' },
  { bit: 7, name: 'Bandage' },
  { bit: 8, name: 'Other' },
];

SPELL_DBC_ITEM_SUBCLASS[1] = [
  { bit: 0, name: 'Bag' },
  { bit: 1, name: 'Soul Bag' },
  { bit: 2, name: 'Herb Bag' },
  { bit: 3, name: 'Enchanting Bag' },
  { bit: 4, name: 'Engineering Bag' },
  { bit: 5, name: 'Gem Bag' },
  { bit: 6, name: 'Mining Bag' },
  { bit: 7, name: 'Leatherworking Bag' },
  { bit: 8, name: 'Inscription Bag' },
];

SPELL_DBC_ITEM_SUBCLASS[2] = [
  { bit: 0, name: 'Axe' },
  { bit: 1, name: 'Axe' },
  { bit: 2, name: 'Bow' },
  { bit: 3, name: 'Gun' },
  { bit: 4, name: 'Mace' },
  { bit: 5, name: 'Mace' },
  { bit: 6, name: 'Polearm' },
  { bit: 7, name: 'Sword' },
  { bit: 8, name: 'Sword' },
  { bit: 9, name: 'Obsolete' },
  { bit: 10, name: 'Staff' },
  { bit: 11, name: 'Exotic' },
  { bit: 12, name: 'Exotic' },
  { bit: 13, name: 'Fist Weapon' },
  { bit: 14, name: 'Miscellaneous' },
  { bit: 15, name: 'Dagger' },
  { bit: 16, name: 'Thrown' },
  { bit: 17, name: 'Spear' },
  { bit: 18, name: 'Crossbow' },
  { bit: 19, name: 'Wand' },
  { bit: 20, name: 'Fishing Pole' },
];

SPELL_DBC_ITEM_SUBCLASS[3] = [
  { bit: 0, name: 'Red' },
  { bit: 1, name: 'Blue' },
  { bit: 2, name: 'Yellow' },
  { bit: 3, name: 'Purple' },
  { bit: 4, name: 'Green' },
  { bit: 5, name: 'Orange' },
  { bit: 6, name: 'Meta' },
  { bit: 7, name: 'Simple' },
  { bit: 8, name: 'Prismatic' },
];

SPELL_DBC_ITEM_SUBCLASS[4] = [
  { bit: 0, name: 'Miscellaneous' },
  { bit: 1, name: 'Cloth' },
  { bit: 2, name: 'Leather' },
  { bit: 3, name: 'Mail' },
  { bit: 4, name: 'Plate' },
  { bit: 5, name: 'Buckler' },
  { bit: 6, name: 'Shield' },
  { bit: 7, name: 'Libram' },
  { bit: 8, name: 'Idol' },
  { bit: 9, name: 'Totem' },
  { bit: 10, name: 'Sigil' },
];

SPELL_DBC_ITEM_SUBCLASS[5] = [{ bit: 0, name: 'Reagent' }];

SPELL_DBC_ITEM_SUBCLASS[6] = [
  { bit: 0, name: 'Wand' },
  { bit: 1, name: 'Bolt' },
  { bit: 2, name: 'Arrow' },
  { bit: 3, name: 'Bullet' },
  { bit: 4, name: 'Thrown' },
];

SPELL_DBC_ITEM_SUBCLASS[7] = [
  { bit: 0, name: 'Trade Goods' },
  { bit: 1, name: 'Parts' },
  { bit: 2, name: 'Explosives' },
  { bit: 3, name: 'Devices' },
  { bit: 4, name: 'Jewelcrafting' },
  { bit: 5, name: 'Cloth' },
  { bit: 6, name: 'Leather' },
  { bit: 7, name: 'Metal &amp; Stone' },
  { bit: 8, name: 'Meat' },
  { bit: 9, name: 'Herb' },
  { bit: 10, name: 'Elemental' },
  { bit: 11, name: 'Other' },
  { bit: 12, name: 'Enchanting' },
  { bit: 13, name: 'Materials' },
  { bit: 14, name: 'Armor Enchantment' },
  { bit: 15, name: 'Weapon Enchantment' },
];

SPELL_DBC_ITEM_SUBCLASS[8] = [{ bit: 0, name: 'Generic' }];

SPELL_DBC_ITEM_SUBCLASS[9] = [
  { bit: 0, name: 'Book' },
  { bit: 1, name: 'Leatherworking' },
  { bit: 2, name: 'Tailoring' },
  { bit: 3, name: 'Engineering' },
  { bit: 4, name: 'Blacksmithing' },
  { bit: 5, name: 'Cooking' },
  { bit: 6, name: 'Alchemy' },
  { bit: 7, name: 'First Aid' },
  { bit: 8, name: 'Enchanting' },
  { bit: 9, name: 'Fishing' },
  { bit: 10, name: 'Jewelcrafting' },
];

SPELL_DBC_ITEM_SUBCLASS[10] = [{ bit: 0, name: 'Money' }];

SPELL_DBC_ITEM_SUBCLASS[11] = [
  { bit: 0, name: 'Quiver (OBSOLETE)' },
  { bit: 1, name: 'Quiver (OBSOLETE)' },
  { bit: 2, name: 'Quiver' },
  { bit: 3, name: 'Ammo Pouch' },
];

SPELL_DBC_ITEM_SUBCLASS[12] = [{ bit: 0, name: 'Quest' }];

SPELL_DBC_ITEM_SUBCLASS[13] = [
  { bit: 0, name: 'Key' },
  { bit: 1, name: 'Lockpick' },
];

SPELL_DBC_ITEM_SUBCLASS[14] = [{ bit: 0, name: 'Permanent' }];

SPELL_DBC_ITEM_SUBCLASS[15] = [
  { bit: 0, name: 'Junk' },
  { bit: 1, name: 'Reagent' },
  { bit: 2, name: 'Pet' },
  { bit: 3, name: 'Holiday' },
  { bit: 4, name: 'Other' },
  { bit: 5, name: 'Mount' },
];

SPELL_DBC_ITEM_SUBCLASS[16] = [
  { bit: 1, name: 'Warrior' },
  { bit: 2, name: 'Paladin' },
  { bit: 3, name: 'Hunter' },
  { bit: 4, name: 'Rogue' },
  { bit: 5, name: 'Priest' },
  { bit: 6, name: 'Death Knight' },
  { bit: 7, name: 'Shaman' },
  { bit: 8, name: 'Mage' },
  { bit: 9, name: 'Warlock' },
  { bit: 11, name: 'Druid' },
];
