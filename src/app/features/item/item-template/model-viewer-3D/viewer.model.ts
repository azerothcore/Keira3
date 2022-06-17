export const CONTENT_PATH = 'https://wow.zamimg.com/modelviewer/live/';

export type Gender = 0 | 1;

export const enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
}

const enum SLOTS {
  NECK = 2,
  FINGER1 = 11,
  FINGER2 = 12,
  TRINKET1 = 13,
  TRINKET2 = 14,
  CHEST = 20, // Robe/Chest
  MAIN_HAND = 21,
  OFF_HAND = 22,
}

export const NOT_DISPLAYED_SLOTS = [SLOTS.NECK, SLOTS.FINGER1, SLOTS.FINGER2, SLOTS.TRINKET1, SLOTS.TRINKET2];

export const RACES = {
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

export const CHARACTER_PART = {
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

export interface WoWModel {
  id: number | string;
  type: number;
  race?: number;
  gender?: Gender;
  items?: [];
}

export interface DisplayInfo {
  displaySlot: number;
  displayId: number;
}

export const wotlkToShadowlandSlots = {
  5: SLOTS.CHEST,
  11: SLOTS.MAIN_HAND,
  16: SLOTS.MAIN_HAND,
  17: SLOTS.OFF_HAND,
  18: SLOTS.OFF_HAND,
};
