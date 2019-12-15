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
export const SAI_TARGET_PARAM1_NAMES = [];
export const SAI_TARGET_PARAM2_NAMES = [];
export const SAI_TARGET_PARAM3_NAMES = [];
export const SAI_TARGET_PARAM4_NAMES = [];
export const SAI_TARGET_PARAM1_TOOLTIPS = [];
export const SAI_TARGET_PARAM2_TOOLTIPS = [];
export const SAI_TARGET_PARAM3_TOOLTIPS = [];
export const SAI_TARGET_PARAM4_TOOLTIPS = [];

// SMART_TARGET_NONE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.NONE] = 'No specified target. Only use this if you\'re sure the action type does not use targets at all (and event then it could not be safe. It\'s usually smart to default to SMART_TARGET_SELF (1)).';

// SMART_TARGET_SELF
SAI_TARGET_TOOLTIPS[SAI_TARGETS.SELF] = 'Targets the creature/gameobject/areatrigger itself';

// SMART_TARGET_VICTIM
SAI_TARGET_TOOLTIPS[SAI_TARGETS.VICTIM] = 'Targets the current victim of the creature';

// SMART_TARGET_HOSTILE_SECOND_AGGRO
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_SECOND_AGGRO] = 'The unit that is second highest on the current threatlist of the creature';

// SMART_TARGET_HOSTILE_LAST_AGGRO
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_LAST_AGGRO] = 'The unit that is last (so lowest threat) on the current threatlist of the creature';

// SMART_TARGET_HOSTILE_RANDOM
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_RANDOM] = 'A random unit on the current threatlist of the creature';

// SMART_TARGET_HOSTILE_RANDOM_NOT_TOP
SAI_TARGET_TOOLTIPS[SAI_TARGETS.HOSTILE_RANDOM_NOT_TOP] = 'A random unit on the current threatlist of the creature. Ignores the last unit on the threatlist (so it can never target unit with lowest threat)';

// SMART_TARGET_ACTION_INVOKER
SAI_TARGET_TOOLTIPS[SAI_TARGETS.ACTION_INVOKER] = 'The unit that caused this event type to occur. For example if used with SMART_EVENT_SPELLHIT, the initial caster of the spell will be targeted by this target type.';

// SMART_TARGET_POSITION
SAI_TARGET_TOOLTIPS[SAI_TARGETS.POSITION] = 'Targets a given position. Only a handful of action types actually use this so make sure you\'re using one of these! This target type uses the target coordinate parameters and not the normal target parameter fields.';

// SMART_TARGET_CREATURE_RANGE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CREATURE_RANGE] = 'Targets any creature of a given entry within a given range (if entry is left at 0 it will target all creatures within the given range)';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CREATURE_RANGE]  = 'CreatureId';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CREATURE_RANGE]  = 'MinDistance';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.CREATURE_RANGE]  = 'MaxDistance';
SAI_TARGET_PARAM4_NAMES[SAI_TARGETS.CREATURE_RANGE]  = 'AliveState';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.CREATURE_RANGE]  = 'If left at 0, it will target all creatures within the given distance';
SAI_TARGET_PARAM4_TOOLTIPS[SAI_TARGETS.CREATURE_RANGE]  = '1 alive, 2 dead, 0 both';

// SMART_TARGET_CREATURE_GUID
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CREATURE_GUID] = 'Targets a specific creature guid and entry';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CREATURE_GUID] = 'CreatureGuid';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CREATURE_GUID] = 'CreatureId';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.CREATURE_GUID] = 'GetFromHashMap';
SAI_TARGET_PARAM3_TOOLTIPS[SAI_TARGETS.CREATURE_GUID] = '0 or 1, note that this does not work in instances';

// SMART_TARGET_CREATURE_DISTANCE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CREATURE_DISTANCE] = 'Targets any creature of a given entry (or any creature, if first parameter is 0) within a given distance';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CREATURE_DISTANCE] = 'CreatureId';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CREATURE_DISTANCE] = 'MaxDistance';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.CREATURE_DISTANCE] = 'AliveState';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.CREATURE_DISTANCE] = 'If left at 0, it will target all creatures within the given distance';
SAI_TARGET_PARAM3_TOOLTIPS[SAI_TARGETS.CREATURE_DISTANCE]  = '1 alive, 2 dead, 0 both';

// SMART_TARGET_STORED
SAI_TARGET_TOOLTIPS[SAI_TARGETS.STORED] = 'Takes a target stored by an id when using SMART_ACTION_STORE_TARGET_LIST';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.STORED] = 'StoreId';

// SMART_TARGET_GAMEOBJECT_RANGE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_RANGE] = 'Targets any gameobject of a given entry within a given range (if entry is left at 0 it will target all gameobjects within the given range)';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.GAMEOBJECT_RANGE] = 'GameobjectId';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.GAMEOBJECT_RANGE] = 'MinDistance';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.GAMEOBJECT_RANGE] = 'MaxDistance';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_RANGE] = 'If left at 0, it will target all gameobjects within the given distance';

// SMART_TARGET_GAMEOBJECT_GUID
SAI_TARGET_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_GUID] = 'Targets a specific gameobject guid and entry';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.GAMEOBJECT_GUID] = 'GameobjectGuid';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.GAMEOBJECT_GUID] = 'GameobjectId';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.GAMEOBJECT_GUID] = 'GetFromHashMap';
SAI_TARGET_PARAM3_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_GUID] = '0 or 1, note that this does not work in instances';


// SMART_TARGET_GAMEOBJECT_DISTANCE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_DISTANCE] = 'Targets any gameobject of a given entry (or any gameobject, if first parameter is left at 0) within a given distance';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.GAMEOBJECT_DISTANCE] = 'GameobjectId';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.GAMEOBJECT_DISTANCE] = 'MaxDistance';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.GAMEOBJECT_DISTANCE] = 'If left at 0, it will target all gameobjects within the given distance';

// SMART_TARGET_INVOKER_PARTY
SAI_TARGET_TOOLTIPS[SAI_TARGETS.INVOKER_PARTY] = 'Targets all party members of the action invoker (SMART_TARGET_ACTION_INVOKER)';

// SMART_TARGET_PLAYER_RANGE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.PLAYER_RANGE] = 'Targets any player within a given minimum and maximum distance';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.PLAYER_RANGE] = 'MinDistance';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.PLAYER_RANGE] = 'MaxDistance';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.PLAYER_RANGE] = 'MaxCount';

// SMART_TARGET_PLAYER_DISTANCE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.PLAYER_DISTANCE] = 'Targets any player within a given maximum distance';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.PLAYER_DISTANCE] = 'MaxDistance';

// SMART_TARGET_CLOSEST_CREATURE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_CREATURE] = 'Takes the closest creature within a given distance and entry (or the closest creature of any entry, if first parameter is left at 0).';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CLOSEST_CREATURE] = 'CreatureId';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CLOSEST_CREATURE] = 'MaxDistance';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.CLOSEST_CREATURE] = 'MustBeDead';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.CLOSEST_CREATURE] = 'If left at 0, it will target the closest creature of ANY entry';
SAI_TARGET_PARAM2_TOOLTIPS[SAI_TARGETS.CLOSEST_CREATURE] = 'Can be from 0 to 100 yards';
SAI_TARGET_PARAM3_TOOLTIPS[SAI_TARGETS.CLOSEST_CREATURE] = 'If set to 0 it will only target alive creatures; if set to 1 it will target only alive creatures';

// SMART_TARGET_CLOSEST_GAMEOBJECT
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_GAMEOBJECT] = 'Takes the closest gameobject within a given distance and entry (or the closest gameobject of any entry, if first parameter is left at 0).';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CLOSEST_GAMEOBJECT] = 'GameobjectId';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CLOSEST_GAMEOBJECT] = 'MaxDistance';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.CLOSEST_GAMEOBJECT] = 'If left at 0, it will target the closest gameobject of ANY entry';
SAI_TARGET_PARAM2_TOOLTIPS[SAI_TARGETS.CLOSEST_GAMEOBJECT] = 'Can be from 0 to 100 yards';

// SMART_TARGET_CLOSEST_PLAYER
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_PLAYER] = 'Takes the closest player within a given distance';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CLOSEST_PLAYER] = 'MaxDistance';

// SMART_TARGET_ACTION_INVOKER_VEHICLE
SAI_TARGET_TOOLTIPS[SAI_TARGETS.ACTION_INVOKER_VEHICLE] = 'Takes the vehicle of the action invoker (SMART_TARGET_ACTION_INVOKER)';

// SMART_TARGET_OWNER_OR_SUMMONER
SAI_TARGET_TOOLTIPS[SAI_TARGETS.OWNER_OR_SUMMONER] = 'Takes the owner or the summoner of the creature/gameobject';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.OWNER_OR_SUMMONER] = 'OwnerOfOwner';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.OWNER_OR_SUMMONER] = '0 or 1';

// SMART_TARGET_THREAT_LIST
SAI_TARGET_TOOLTIPS[SAI_TARGETS.THREAT_LIST] = 'Targets the entire threatlist of the creature';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.THREAT_LIST] = 'MaxDistance';
SAI_TARGET_PARAM1_TOOLTIPS[SAI_TARGETS.THREAT_LIST] = 'Use 0 for any distance';

// SMART_TARGET_CLOSEST_ENEMY
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_ENEMY] = 'Takes the closest unfriendly unit (both creatures and players) within a given distance. If second parameter is set to 1, it will only target nearby friendly players';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CLOSEST_ENEMY] = 'MaxDistance';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CLOSEST_ENEMY] = 'PlayerOnly';
SAI_TARGET_PARAM2_TOOLTIPS[SAI_TARGETS.CLOSEST_ENEMY] = '0 or 1';

// SMART_TARGET_CLOSEST_FRIENDLY
SAI_TARGET_TOOLTIPS[SAI_TARGETS.CLOSEST_FRIENDLY] = 'Takes the closest friendly unit (both creatures and players) within a given distance. If second parameter is set to 1, it will only target nearby friendly players';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.CLOSEST_FRIENDLY] = 'MaxDistance';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.CLOSEST_FRIENDLY] = 'PlayerOnly';
SAI_TARGET_PARAM2_TOOLTIPS[SAI_TARGETS.CLOSEST_FRIENDLY] = '0 or 1';

// SMART_TARGET_FARTHEST
SAI_TARGET_TOOLTIPS[SAI_TARGETS.FARTHEST] = 'Farthest unit on the threat list';
SAI_TARGET_PARAM1_NAMES[SAI_TARGETS.FARTHEST] = 'MaxDistance';
SAI_TARGET_PARAM2_NAMES[SAI_TARGETS.FARTHEST] = 'PlayerOnly';
SAI_TARGET_PARAM3_NAMES[SAI_TARGETS.FARTHEST] = 'IsInLos';
SAI_TARGET_PARAM2_TOOLTIPS[SAI_TARGETS.FARTHEST] = '0 or 1';
SAI_TARGET_PARAM3_TOOLTIPS[SAI_TARGETS.FARTHEST] = '0 or 1';
