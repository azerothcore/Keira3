export const SIDE = {
  '-1': 'Alliance only',
  '-2': 'Horde only',
  0: null,
  1: 'Alliance',
  2: 'Horde',
  3: 'Both',
};

// ChrClasses.dbc
export const CLASSES_TEXT = [
  null,
  'Warrior',
  'Paladin',
  'Hunter',
  'Rogue',
  'Priest',
  'Death Knight',
  'Shaman',
  'Mage',
  'Warlock',
  null,
  'Druid',
];

// ChrRaces.dbc
export type RacesTextKey = keyof typeof RACES_TEXT;
export type RacesTextValue = (typeof RACES_TEXT)[RacesTextKey];
export const RACES_TEXT = {
  '-2': 'Horde',
  '-1': 'Alliance',
  0: null,
  1: 'Human',
  2: 'Orc',
  3: 'Dwarf',
  4: 'Night Elf',
  5: 'Undead',
  6: 'Tauren',
  7: 'Gnome',
  8: 'Troll',
  9: null,
  10: 'Blood Elf',
  11: 'Draenei',
};
