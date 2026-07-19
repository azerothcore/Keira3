import { ItemTemplate } from '@keira/shared/acore-world-model';
import { Option } from '@keira/shared/constants';

export const enum VIEWER_TYPE {
  ITEM,
  NPC,
  OBJECT,
}

export const CONTENT_WOTLK = 'https://wowgaming.altervista.org/modelviewer/data/get.php?path=';

export const enum Gender {
  MALE = 0,
  FEMALE = 1,
}

export const enum MODEL_TYPE {
  WEAPON = 1,
  HELMET = 2,
  SHOULDER = 4,
  NPC = 8,
  CHARACTER = 16,
  HUMANOIDNPC = 32,
  OBJECT = 64,
  ARMOR = 128,
  PATH = 256,
  ITEMVISUAL = 512,
  COLLECTION = 1024,
}

export const enum SLOTS {
  HEAD = 1,
  NECK = 2,
  SHOULDERS = 3,
  BODY = 4,
  CHEST = 5,
  WAIST = 6,
  LEGS = 7,
  FEET = 8,
  WRISTS = 9,
  HANDS = 10,
  FINGER1 = 11,
  FINGER2 = 12,
  TRINKET1 = 13,
  TRINKET2 = 14,
  BACK = 15,
  MAIN_HAND = 16,
  OFF_HAND = 17,
  RANGED = 18,
  TABARD = 19,
  ROBE = 20, // Robe/Chest
  MAIN_HAND_NEW = 21,
  OFF_HAND_NEW = 22,
}

export const NOT_DISPLAYED_SLOTS = [SLOTS.NECK, SLOTS.FINGER1, SLOTS.FINGER2, SLOTS.TRINKET1, SLOTS.TRINKET2];

export const RACES: Record<number, string> = {
  1: 'human',
  2: 'orc',
  3: 'dwarf',
  4: 'nightelf',
  5: 'scourge',
  6: 'tauren',
  7: 'gnome',
  8: 'troll',
  10: 'bloodelf',
  11: 'draenei',
};

export const CHARACTER_PART: Record<string, keyof CharacterOptions | undefined> = {
  Face: 'face',
  'Skin Color': 'skin',
  'Hair Style': 'hairStyle',
  'Hair Color': 'hairColor',
  'Facial Hair': 'facialStyle',
  Mustache: 'facialStyle',
  Beard: 'facialStyle',
  Sideburns: 'facialStyle',
  'Face Shape': 'facialStyle',
  Eyebrow: 'facialStyle',
  'Jaw Features': undefined,
  'Face Features': undefined,
  'Skin Type': undefined,
  Ears: undefined,
  Horns: undefined,
  Blindfold: undefined,
  Tattoo: undefined,
  'Eye Color': undefined,
  'Tattoo Color': undefined,
  Armbands: undefined,
  'Jewelry Color': undefined,
  Bracelets: undefined,
  Necklace: undefined,
  Earring: undefined,
};

export interface DisplayInfo {
  displaySlot: number;
  displayId: number;
}

export const wotlkToShadowlandSlots = {
  5: SLOTS.CHEST,
  11: SLOTS.MAIN_HAND_NEW,
  16: SLOTS.MAIN_HAND_NEW,
  17: SLOTS.OFF_HAND,
  18: SLOTS.OFF_HAND,
};

export const enum InventoryType {
  NON_EQUIP = 0,
  HEAD = 1,
  NECK = 2,
  SHOULDERS = 3,
  SHIRT = 4,
  CHEST = 5,
  WAIST = 6,
  LEGS = 7,
  FEET = 8,
  WRISTS = 9,
  HANDS = 10,
  FINGER = 11,
  TRINKET = 12,
  WEAPON = 13,
  SHIELD = 14,
  RANGED = 15,
  CLOAK = 16,
  TWO_HANDED_WEAPON = 17,
  BAG = 18,
  TABARD = 19,
  ROBE = 20,
  WEAPON_MAIN_HAND = 21,
  WEAPON_OFF_HAND = 22,
  HELD_IN_OFF_HAND = 23,
  AMMO = 24,
  THROWN = 25,
  RANGED_RIGHT = 26,
  QUIVER = 27,
  RELIC = 28,
}

export const WEAPONS_INVENTORY_TYPE = [
  InventoryType.WEAPON,
  InventoryType.SHIELD,
  InventoryType.RANGED,
  InventoryType.TWO_HANDED_WEAPON,
  InventoryType.WEAPON_MAIN_HAND,
  InventoryType.WEAPON_OFF_HAND,
  InventoryType.HELD_IN_OFF_HAND,
  InventoryType.THROWN,
  InventoryType.RANGED_RIGHT,
];

export const CHAR_DISPLAYABLE_INVENTORY_TYPE = [
  InventoryType.CHEST,
  InventoryType.CLOAK,
  InventoryType.FEET,
  InventoryType.HANDS,
  InventoryType.LEGS,
  InventoryType.ROBE,
  InventoryType.WAIST,
  InventoryType.TABARD,
  InventoryType.WRISTS,
];

export enum Race {
  HUMAN = 1,
  ORC = 2,
  DWARF = 3,
  NIGHTELF = 4,
  UNDEAD = 5, // SCOURGE
  TAUREN = 6,
  GNOME = 7,
  TROLL = 8,
  GOBLIN = 9,
  BLOODELF = 10,
  DRAENEI = 11,
  // WORGEN = 22,
  // PANDAREN = 24,
  // NIGHTBORNE = 27,
  // HIGHMOUNTAINTAUREN = 28,
  // VOIDELF = 29,
  // LIGHTFORGEDDRAENEI = 30,
  // ZANDALARITROLL = 31,
  // KULTIRAN = 32,
  // DARKIRONDWARF = 34,
  // VULPERA = 35,
  // MAGHARORC = 36,
  // MECHAGNOME = 37,
  // DRACTHYR = 45,
}

// NpC, GameObject, Item
export interface WoWModel {
  id: number | string;
  type: number;
}

export interface CharacterOptions {
  face: number;
  facialStyle: number;
  gender: Gender;
  hairColor: number;
  hairStyle: number;
  race: Race;
  skin: number;
  items: [InventoryType, ItemTemplate['displayid']][];
}

export const CREATURE_GENDER_OPTION_ICON: Option[] = [
  { value: 0, name: 'Male', icon: 'race/1-0.gif' },
  { value: 1, name: 'Female', icon: 'race/1-1.gif' },
];
