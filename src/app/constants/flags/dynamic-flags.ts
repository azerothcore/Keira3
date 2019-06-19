import { Flag } from '../../types/general';

export const DYNAMIC_FLAGS: Flag[] = [
  { bit: 0, name: 'NONE'},
  { bit: 1, name: 'LOOTABLE'},
  { bit: 2, name: 'TRACK_UNIT - Creature’s location will be seen as a small dot in the minimap'},
  { bit: 3, name: 'TAPPED - Makes creatures name appear grey (Lua_UnitIsTapped)'},
  { bit: 4, name: 'TAPPED_BY_PLAYER - Lua_UnitIsTappedByPlayer usually used by PCVs (Player Controlled Vehicles'},
  { bit: 5, name: 'SPECIALINFO'},
  { bit: 6, name: 'DEAD - Makes the creature appear dead (this DOES NOT make the creature’s name grey or not attack players).'},
  { bit: 7, name: 'REFER_A_FRIEND'},
  { bit: 8, name: 'TAPPED_BY_ALL_THREAT_LIST - Lua_UnitIsTappedByAllThreatList'},
];
