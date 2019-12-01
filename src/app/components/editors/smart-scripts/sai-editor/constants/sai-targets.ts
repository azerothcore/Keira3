import { getEnumKeys } from '../../../../../utils/helpers';

export enum SAI_TARGETS {
  NONE = 0,
  SELF = 1,
  VICTIM = 2,
  HOSTILE_SECOND_AGGRO = 3,
  HOSTILE_LAST_AGGRO = 4,
  HOSTILE_RANDOM = 5,
  HOSTILE_RANDOM_NOT_TOP = 6,
  ACTION_INVOKER = 7,
  POSITION = 8,
  CREATURE_RANGE = 9,
  CREATURE_GUID = 10,
  CREATURE_DISTANCE = 11,
  STORED = 12,
  GAMEOBJECT_RANGE = 13,
  GAMEOBJECT_GUID = 14,
  GAMEOBJECT_DISTANCE = 15,
  INVOKER_PARTY = 16,
  PLAYER_RANGE = 17,
  PLAYER_DISTANCE = 18,
  CLOSEST_CREATURE = 19,
  CLOSEST_GAMEOBJECT = 20,
  CLOSEST_PLAYER = 21,
  ACTION_INVOKER_VEHICLE = 22,
  OWNER_OR_SUMMONER = 23,
  THREAT_LIST = 24,
  CLOSEST_ENEMY = 25,
  CLOSEST_FRIENDLY = 26,
  // LOOT_RECIPIENTS                = 27,   // NOT SUPPORTED YET
  FARTHEST = 28,
  // VEHICLE_PASSENGER              = 29,   // NOT SUPPORTED YET
}

export const SAI_TARGETS_KEYS = getEnumKeys(SAI_TARGETS);

export const SAI_TARGET_TOOLTIPS = [];
SAI_TARGET_TOOLTIPS[SAI_TARGETS.NONE] = 'No specified target. Only use this if you\'re sure the action type does not use targets at all (and event then it could not be safe. It\'s usually smart to default to SMART_TARGET_SELF (1)).';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.SELF] = 'Targets the creature/gameobject/areatrigger itself';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.VICTIM] = 'Targets the current victim of the creature';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_SECOND_AGGRO] = 'The unit that is second highest on the current threatlist of the creature';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_LAST_AGGRO] = 'The unit that is last (so lowest threat) on the current threatlist of the creature';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_RANDOM] = 'A random unit on the current threatlist of the creature';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_RANDOM_NOT_TOP] = 'A random unit on the current threatlist of the creature. Ignores the last unit on the threatlist (so it can never target unit with lowest threat)';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.ACTION_INVOKER] = 'The unit that caused this event type to occur. For example if used with SMART_EVENT_SPELLHIT, the initial caster of the spell will be targeted by this target type.';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.POSITION] = 'Targets a given position. Only a handful of action types actually use this so make sure you\'re using one of these! This target type uses the target coordinate parameters and not the normal target parameter fields.';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CREATURE_RANGE] = 'Targets any creature of a given entry within a given range (if entry is left at 0 it will target all creatures within the given range)';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CREATURE_GUID] = 'Targets a specific creature guid and entry';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CREATURE_DISTANCE] = 'Targets any creature of a given entry (or any creature, if first parameter is 0) within a given distance';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.STORED] = 'Takes a target stored by an id when using SMART_ACTION_STORE_TARGET_LIST';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_RANGE] = 'Targets any gameobject of a given entry within a given range (if entry is left at 0 it will target all gameobjects within the given range)';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_GUID] = 'Targets a specific gameobject guid and entry';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_DISTANCE] = 'Targets any gameobject of a given entry (or any gameobject, if first parameter is left at 0) within a given distance';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.INVOKER_PARTY] = 'Targets all party members of the action invoker (SMART_TARGET_ACTION_INVOKER)';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.PLAYER_RANGE] = 'Targets any player within a given minimum and maximum distance';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.PLAYER_DISTANCE] = 'Targets any player within a given maximum distance';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_CREATURE] = 'Takes the closest creature within a given distance and entry (or the closest creature of any entry, if first parameter is left at 0).';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_GAMEOBJECT] = 'Takes the closest gameobject within a given distance and entry (or the closest gameobject of any entry, if first parameter is left at 0).';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_PLAYER] = 'Takes the closest player within a given distance';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.ACTION_INVOKER_VEHICLE] = 'Takes the vehicle of the action invoker (SMART_TARGET_ACTION_INVOKER)';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.OWNER_OR_SUMMONER] = 'Takes the owner or the summoner of the creature/gameobject';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.THREAT_LIST] = 'Targets the entire threatlist of the creature';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_ENEMY] = 'Takes the closest unfriendly unit (both creatures and players) within a given distance. If second parameter is set to 1, it will only target nearby friendly players';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_FRIENDLY] = 'Takes the closest friendly unit (both creatures and players) within a given distance. If second parameter is set to 1, it will only target nearby friendly players';
SAI_TARGET_TOOLTIPS[SAI_TARGETS.FARTHEST] = 'Farthest unit on the threat list';

export const SAI_TARGET_PARAM1_NAMES = [];
// TODO: add missing values

export const SAI_TARGET_PARAM2_NAMES = [];
// TODO: add missing values

export const SAI_TARGET_PARAM3_NAMES = [];
// TODO: add missing values

export const SAI_TARGET_PARAM4_NAMES = [];
// TODO: add missing values

export const SAI_TARGET_PARAM1_TOOLTIPS = [];
// TODO: add missing values

export const SAI_TARGET_PARAM2_TOOLTIPS = [];
// TODO: add missing values

export const SAI_TARGET_PARAM3_TOOLTIPS = [];
// TODO: add missing values

export const SAI_TARGET_PARAM4_TOOLTIPS = [];
// TODO: add missing values
