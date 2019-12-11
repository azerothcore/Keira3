import { getEnumKeys } from '../../../../../utils/helpers';

export enum SAI_EVENTS {
  UPDATE_IC = 0,
  UPDATE_OOC = 1,
  HEALTH_PCT = 2,
  MANA_PCT = 3,
  AGGRO = 4,
  KILL = 5,
  DEATH = 6,
  EVADE = 7,
  SPELLHIT = 8,
  RANGE = 9,
  OOC_LOS = 10,
  RESPAWN = 11,
  TARGET_HEALTH_PCT = 12,
  VICTIM_CASTING = 13,
  FRIENDLY_HEALTH = 14,
  FRIENDLY_IS_CC = 15,
  FRIENDLY_MISSING_BUFF = 16,
  SUMMONED_UNIT = 17,
  TARGET_MANA_PCT = 18,
  ACCEPTED_QUEST = 19,
  REWARD_QUEST = 20,
  REACHED_HOME = 21,
  RECEIVE_EMOTE = 22,
  HAS_AURA = 23,
  TARGET_BUFFED = 24,
  RESET = 25,
  IC_LOS = 26,
  PASSENGER_BOARDED = 27,
  PASSENGER_REMOVED = 28,
  CHARMED = 29,
  CHARMED_TARGET = 30,
  SPELLHIT_TARGET = 31,
  DAMAGED = 32,
  DAMAGED_TARGET = 33,
  MOVEMENTINFORM = 34,
  SUMMON_DESPAWNED = 35,
  CORPSE_REMOVED = 36,
  AI_INIT = 37,
  DATA_SET = 38,
  WAYPOINT_START = 39,
  WAYPOINT_REACHED = 40,
  TRANSPORT_ADDPLAYER = 41,
  TRANSPORT_ADDCREATURE = 42,
  TRANSPORT_REMOVE_PLAYER = 43,
  TRANSPORT_RELOCATE = 44,
  INSTANCE_PLAYER_ENTER = 45,
  AREATRIGGER_ONTRIGGER = 46,
  QUEST_ACCEPTED = 47,
  QUEST_OBJ_COPLETETION = 48,
  QUEST_COMPLETION = 49,
  QUEST_REWARDED = 50,
  QUEST_FAIL = 51,
  TEXT_OVER = 52,
  RECEIVE_HEAL = 53,
  JUST_SUMMONED = 54,
  WAYPOINT_PAUSED = 55,
  WAYPOINT_RESUMED = 56,
  WAYPOINT_STOPPED = 57,
  WAYPOINT_ENDED = 58,
  TIMED_EVENT_TRIGGERED = 59,
  UPDATE = 60,
  LINK = 61,
  GOSSIP_SELECT = 62,
  JUST_CREATED = 63,
  GOSSIP_HELLO = 64,
  FOLLOW_COMPLETED = 65,
  // UNUSED_66                = 66, // unused
  IS_BEHIND_TARGET = 67,
  GAME_EVENT_START = 68,
  GAME_EVENT_END = 69,
  GO_STATE_CHANGED = 70,
  GO_EVENT_INFORM = 71,
  ACTION_DONE = 72,
  ON_SPELLCLICK = 73,
  FRIENDLY_HEALTH_PCT = 74,
  DISTANCE_CREATURE = 75,
  DISTANCE_GAMEOBJECT = 76,
  COUNTER_SET = 77,
}
export const SAI_EVENTS_KEYS = getEnumKeys(SAI_EVENTS);
export const SAI_EVENT_TOOLTIPS: string[] = [];
export const SAI_EVENT_PARAM1_NAMES: string[] = [];
export const SAI_EVENT_PARAM2_NAMES: string[] = [];
export const SAI_EVENT_PARAM3_NAMES: string[] = [];
export const SAI_EVENT_PARAM4_NAMES: string[] = [];
export const SAI_EVENT_PARAM1_TOOLTIPS: string[] = [];
export const SAI_EVENT_PARAM2_TOOLTIPS: string[] = [];
export const SAI_EVENT_PARAM3_TOOLTIPS: string[] = [];
export const SAI_EVENT_PARAM4_TOOLTIPS: string[] = [];

// SMART_EVENT_UPDATE_IC
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE_IC] = 'While in combat. Parameters represent a timer: 1000,2000,4000,4000 will call this event_type randomly between 1 and 2 seconds and repeat this every 4 seconds';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.UPDATE_IC] = 'InitialMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.UPDATE_IC] = 'InitialMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.UPDATE_IC] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.UPDATE_IC] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.UPDATE_IC] = 'Timer min';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.UPDATE_IC] = 'Timer max';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.UPDATE_IC] = 'Repeat timer min';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.UPDATE_IC] = 'Repeat timer max';

// SMART_EVENT_UPDATE_OOC
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE_OOC] = 'While out of combat. Parameters represent a timer: 1000,2000,4000,4000 will call this event_type randomly between 1 and 2 seconds and repeat this every 4 seconds';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.UPDATE_OOC] = 'InitialMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.UPDATE_OOC] = 'InitialMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.UPDATE_OOC] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.UPDATE_OOC] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.UPDATE_OOC] = 'Timer min';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.UPDATE_OOC] = 'Timer max';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.UPDATE_OOC] = 'Repeat timer min';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.UPDATE_OOC] = 'Repeat timer max';

// SMART_EVENT_HEALTH_PCT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.HEALTH_PCT] = 'At health percentage. First and second parameters function as min-max health percentage values, so if they are  50,80, the event will be called when the source is between 50% and 80% health. The last two parameters are repeat timers in milliseconds.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.HEALTH_PCT] = 'Min health %';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.HEALTH_PCT] = 'Max health %';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.HEALTH_PCT] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.HEALTH_PCT] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.HEALTH_PCT] = 'Timer min';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.HEALTH_PCT] = 'Timer max';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.HEALTH_PCT] = 'Repeat timer min';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.HEALTH_PCT] = 'Repeat timer max';

// SMART_EVENT_MANA_PCT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.MANA_PCT] = 'At mana percentage. First and second parameters function as min-max mana percentage values, so if they are  50,80, the event will be called when the source is between 50% and 80% mana. The last two parameters are repeat timers in milliseconds.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.MANA_PCT] = 'Min mana pct';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.MANA_PCT] = 'Max mana pct';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.MANA_PCT] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.MANA_PCT] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.MANA_PCT] = 'Timer min';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.MANA_PCT] = 'Timer max';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.MANA_PCT] = 'Repeat timer min';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.MANA_PCT] = 'Repeat timer max';

// SMART_EVENT_AGGRO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AGGRO] = 'When the creature enters combat';

// SMART_EVENT_KILL
SAI_EVENT_TOOLTIPS[SAI_EVENTS.KILL] = 'On creature kill';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.KILL] = 'CooldownMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.KILL] = 'CooldownMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.KILL] = 'Player only';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.KILL] = 'Entry';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.KILL] = '0 or 1';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.KILL] = 'Indicator if killed unit must be player only; if 0, the 4th parameter must be set to the creature id.';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.KILL] = 'Entry of the creature that has to be killed for this event to trigger. Only has effect if third parameter is set to 0.';

// SMART_EVENT_DEATH
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DEATH] = 'On creature death';

// SMART_EVENT_EVADE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.EVADE] = 'On Creature Evade Attack';

// SMART_EVENT_SPELLHIT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SPELLHIT] = 'On Creature/Gameobject Spell Hit';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SPELLHIT] = 'Spell ID';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SPELLHIT] = 'Spell school';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SPELLHIT] = 'CooldownMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.SPELLHIT] = 'CooldownMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.SPELLHIT] = 'Use 0 for any';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.SPELLHIT] = 'Use 0 for any';

// SMART_EVENT_RANGE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RANGE] = 'When the creature is within a certain range of our target type';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RANGE] = 'MinDist';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RANGE] = 'MaxDist';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RANGE] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.RANGE] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.RANGE] = 'Minimum distance to target for the event to be triggered';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.RANGE] = 'Maximum distance to target for the event to be triggered';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.RANGE] = 'Timer min';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.RANGE] = 'Timer max';

// SMART_EVENT_OOC_LOS
SAI_EVENT_TOOLTIPS[SAI_EVENTS.OOC_LOS] = 'On Target In Distance Out of Combat: when the creature detects movement of an unit that is within line of sight while the creature is out of combat. This should be used when attempting to trigger an action when a player or so moves within a distance of some place/trigger.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.OOC_LOS] = 'NoHostile';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.OOC_LOS] = 'MaxRange';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.OOC_LOS] = 'CooldownMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.OOC_LOS] = 'CooldownMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.OOC_LOS] = 'If 0, only non-hostile units can trigger this event. If 1, only hostile units can trigger this event';

// SMART_EVENT_RESPAWN
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RESPAWN] = 'On Creature/Gameobject Respawn';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RESPAWN] = 'Type';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RESPAWN] = 'MapId';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RESPAWN] = 'ZoneId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.RESPAWN] = 'None = 0, Map = 1, Area = 2. Whether the MapId (parameter 2) or the ZoneId (parameter 3) should be checked';

// SMART_EVENT_TARGET_HEALTH_PCT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TARGET_HEALTH_PCT] = 'When the target of the creature is at a certain health percentage';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'HealthMin%';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'HealthMax%';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'RepeatMax';

// SMART_EVENT_VICTIM_CASTING
SAI_EVENT_TOOLTIPS[SAI_EVENTS.VICTIM_CASTING] = 'When the target of the creature is casting a spell. Leaving the third parameter at 0 will mean any spell the target casts will trigger this event.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.VICTIM_CASTING] = 'RepeatMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.VICTIM_CASTING] = 'RepeatMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.VICTIM_CASTING] = 'SpellId';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.VICTIM_CASTING] = 'Spell id the target must be casting to trigger the event. If left at 0, it detects ANY spell.';

// SMART_EVENT_FRIENDLY_HEALTH
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_HEALTH] = 'When a friendly unit within a certain range reaches a certain amount of health (NOT PERCENTAGE). If you are looking for percentage, use event type 74.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'HPDeficit';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'Radius';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.FRIENDLY_HEALTH] = 'Amount of Health the friendly unit must be at (NOT percentage)';

// SMART_EVENT_FRIENDLY_IS_CC
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_IS_CC] = 'When a friendly unit within a certain range is under the effect of a crowd control spell';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_IS_CC] = 'Radius';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_IS_CC] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_IS_CC] = 'RepeatMax';

// SMART_EVENT_FRIENDLY_MISSING_BUFF
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'When a friendly unit within a certain range is missing or having an aura/spell on them. If the first parameter is the SpellId in a negative format, it will mean the event is triggered when a friendly unit within a certain range HAS a buff.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'SpellId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'Radius';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'Spell id for the event to trigger. If the SpellId is negative it means the event is reversed and triggered only when the aura is actually active on the friendly unit.';

// SMART_EVENT_SUMMONED_UNIT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SUMMONED_UNIT] = 'When we summoned a creature with a certain entry. First parameter is the creature entry and if it\'s left at 0 it means we trigger this for any creature.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SUMMONED_UNIT] = 'CreatureId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SUMMONED_UNIT] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SUMMONED_UNIT] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.SUMMONED_UNIT] = 'Creature entry that must be summoned in order for this event to trigger. If left at 0 it will be triggered by ANY creature entry.';

// SMART_EVENT_TARGET_MANA_PCT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TARGET_MANA_PCT] = 'When the target of the creature is at a certain mana percentage';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'ManaMin%';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'ManaMax%';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'RepeatMax';

// SMART_EVENT_ACCEPTED_QUEST
SAI_EVENT_TOOLTIPS[SAI_EVENTS.ACCEPTED_QUEST] = 'When the creature successfully offered a quest to a player';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.ACCEPTED_QUEST] = 'QuestId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.ACCEPTED_QUEST] = 'Quest id to trigger this event; if the parameter is 0 it means it will be triggered by ANY quest.';

// SMART_EVENT_REWARD_QUEST
SAI_EVENT_TOOLTIPS[SAI_EVENTS.REWARD_QUEST] = 'When the creature successfully rewarded a quest of a player';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.REWARD_QUEST] = 'QuestId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.REWARD_QUEST] = 'Quest id to trigger this event; if the parameter is 0 it means it will be triggered by ANY quest.';

// SMART_EVENT_REACHED_HOME
SAI_EVENT_TOOLTIPS[SAI_EVENTS.REACHED_HOME] = 'When the creature reached its home position';

// SMART_EVENT_RECEIVE_EMOTE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RECEIVE_EMOTE] = 'When the creature receives an emote';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RECEIVE_EMOTE] = 'EmoteId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RECEIVE_EMOTE] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RECEIVE_EMOTE] = 'RepeatMax';

// SMART_EVENT_HAS_AURA
SAI_EVENT_TOOLTIPS[SAI_EVENTS.HAS_AURA] = 'When the creature is missing or having an aura/spell on them. If the first parameter is the SpellId in a negative format, it will mean the event is triggered when a friendly unit within a certain range is MISSING a buff.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.HAS_AURA] = 'SpellId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.HAS_AURA] = 'Stacks';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.HAS_AURA] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.HAS_AURA] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.HAS_AURA] = 'Spell id for the event to trigger. If the SpellId is negative it means the event is reversed and triggered only when the aura is NOT present on the creature.';

// SMART_EVENT_TARGET_BUFFED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TARGET_BUFFED] = 'When the creature\'s target is missing or having an aura/spell on them. If the first parameter is the SpellId in a negative format, it will mean the event is triggered when a friendly unit within a certain range is MISSING a buff.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'SpellId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'Stacks';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.TARGET_BUFFED] = 'Spell id for the event to trigger. If the SpellId is negative it means the event is reversed and triggered only when the aura is not present on the creature.';

// SMART_EVENT_RESET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RESET] = 'When the creature resets (evades, respawns, spawns or resets out of combat)';

// SMART_EVENT_IC_LOS
SAI_EVENT_TOOLTIPS[SAI_EVENTS.IC_LOS] = 'When the creature detects movement of a unit that is within line of sight while the creature is in combat. This should be used when attempting to trigger an action when a player or so moves within a distance of some place/trigger.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.IC_LOS] = 'NoHostile';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.IC_LOS] = 'Max distance to target';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.IC_LOS] = 'CooldownMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.IC_LOS] = 'CooldownMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.IC_LOS] = 'If 0, only allow non-hostile units to trigger this event. If 1, only allow hostile units to trigger this event.';

// SMART_EVENT_PASSENGER_BOARDED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.PASSENGER_BOARDED] = 'When a passenger is boarded';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.PASSENGER_BOARDED] = 'CooldownMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.PASSENGER_BOARDED] = 'CooldownMax';

// SMART_EVENT_PASSENGER_REMOVED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.PASSENGER_REMOVED] = 'When a passenger is removed';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.PASSENGER_REMOVED] = 'CooldownMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.PASSENGER_REMOVED] = 'CooldownMax';

// SMART_EVENT_CHARMED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.CHARMED] = 'On creature charmed';

// SMART_EVENT_CHARMED_TARGET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.CHARMED_TARGET] = 'On target charmed';

// SMART_EVENT_SPELLHIT_TARGET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SPELLHIT_TARGET] = 'On Target Spell Hit';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'SpellId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'SpellSchool';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.SPELLHIT] = 'Spell id that will limit this event to only be triggered if the spell that hit us has this id. If left at 0, it works for EVERY spell.';

// SMART_EVENT_DAMAGED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DAMAGED] = 'On creature damaged for a certain amount';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DAMAGED] = 'MinDamage';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DAMAGED] = 'MaxDamage';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DAMAGED] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DAMAGED] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.DAMAGED] = 'Minimum amount of damage required to trigger this event';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.DAMAGED] = 'Maximum allowed damage to make this event be able to trigger';

// SMART_EVENT_DAMAGED_TARGET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DAMAGED_TARGET] = 'On target damaged for a certain amount';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'MinDamage';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'MaxDamage';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'RepeatMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.DAMAGED_TARGET] = 'Minimum amount of damage required to trigger this event';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.DAMAGED_TARGET] = 'Maximum allowed damage to make this event be able to trigger';

// SMART_EVENT_MOVEMENTINFORM
SAI_EVENT_TOOLTIPS[SAI_EVENTS.MOVEMENTINFORM] = 'On movement inform. Useful when for example you want your creature to do something after it moving to a certain spot by using SMART_ACTION_MOVE_TO.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.MOVEMENTINFORM] = 'MovementType';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.MOVEMENTINFORM] = 'PointId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.MOVEMENTINFORM] = 'Use 0 for ANY movement types. ESCORT_MOTION_TYPE = 17, POINT_MOTION_TYPE = 8';

// SMART_EVENT_SUMMON_DESPAWNED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SUMMON_DESPAWNED] = 'On summoned unit despawned';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SUMMON_DESPAWNED] = 'CreatureId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SUMMON_DESPAWNED] = 'CooldownMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SUMMON_DESPAWNED] = 'CooldownMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.SUMMON_DESPAWNED] = 'Creature entry to act as a condition. If left at 0, this event is triggered for any summon that despawns. If an entry is given, it is only triggered when that specific entry despawns.';

// SMART_EVENT_CORPSE_REMOVED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.CORPSE_REMOVED] = 'On creature corpse removal';

// SMART_EVENT_AI_INIT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AI_INIT] = 'On AI initialization, so when the creature spawns (not when it respawns, resets or evades!)';

// SMART_EVENT_DATA_SET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DATA_SET] = 'On data set, called after SMART_ACTION_SET_DATA is called to this source with a certain field and a certain value.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DATA_SET] = 'Field';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DATA_SET] = 'Value';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DATA_SET] = 'CooldownMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DATA_SET] = 'CooldownMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.DATA_SET] = 'First parameter of SMART_ACTION_SET_DATA';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.DATA_SET] = 'Second parameter of SMART_ACTION_SET_DATA';

// SMART_EVENT_WAYPOINT_START
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_START] = 'On waypoint started';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_START] = 'PointId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_START] = 'PathId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.WAYPOINT_START] = 'Use 0 for ANY point';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.WAYPOINT_START] = 'Use 0 for ANY path';


// SMART_EVENT_WAYPOINT_REACHED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_REACHED] = 'On waypoint reached';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_REACHED] = 'PointId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_REACHED] = 'PathId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.WAYPOINT_REACHED] = 'Use 0 for ANY point';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.WAYPOINT_REACHED] = 'Use 0 for ANY path';

// SMART_EVENT_TRANSPORT_ADDPLAYER
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_ADDPLAYER] = 'TRANSPORT_ADDPLAYER'; // TODO

// SMART_EVENT_TRANSPORT_ADDCREATURE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_ADDCREATURE] = 'TRANSPORT_ADDCREATURE'; // TODO

// SMART_EVENT_TRANSPORT_REMOVE_PLAYER
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_REMOVE_PLAYER] = 'TRANSPORT_REMOVE_PLAYER'; // TODO

// SMART_EVENT_TRANSPORT_RELOCATE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_RELOCATE] = 'TRANSPORT_RELOCATE'; // TODO

// SMART_EVENT_INSTANCE_PLAYER_ENTER
SAI_EVENT_TOOLTIPS[SAI_EVENTS.INSTANCE_PLAYER_ENTER] = 'INSTANCE_PLAYER_ENTER'; // TODO

// SMART_EVENT_AREATRIGGER_ONTRIGGER
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AREATRIGGER_ONTRIGGER] = 'On areatrigger reached by a player';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.AREATRIGGER_ONTRIGGER] = 'AreatriggerId';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.AREATRIGGER_ONTRIGGER] = 'Entry of the areatrigger to make this event happen. If left at 0, it will trigger for ANY areatrigger';

// SMART_EVENT_QUEST_ACCEPTED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_ACCEPTED] = 'On target quest accepted';

// SMART_EVENT_QUEST_OBJ_COPLETETION
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_OBJ_COPLETETION] = 'On target quest objective completed';

// SMART_EVENT_QUEST_COMPLETION
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_COMPLETION] = 'On target quest completed';

// SMART_EVENT_QUEST_REWARDED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_REWARDED] = 'On target quest rewarded';

// SMART_EVENT_QUEST_FAIL
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_FAIL] = 'On target quest failed';

/*** Keira2 imports ***/
// TODO: check the values below and move them above

// SMART_EVENT_TEXT_OVER
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TEXT_OVER] = 'When a creature says something it shows a balloon for a few seconds. This event is triggered after the balloon fades and thus the text \'finishes\'.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TEXT_OVER] = 'Group id (creature_text)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TEXT_OVER] = 'Creature entry (0 any)';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.TEXT_OVER] = 'The creature_text.groupid value to trigger this event for';

// SMART_EVENT_RECEIVE_HEAL
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RECEIVE_HEAL] = 'On creature received a certain heal amount';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'Minimum heal';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'Maximum heal';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'CooldownMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'CooldownMax';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.RECEIVE_HEAL] = 'Minimum required value the heal effect must be in order to trigger this event';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.RECEIVE_HEAL] = 'Maximum allowed value of the heal effect to allow this event to trigger';

// SMART_EVENT_JUST_SUMMONED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.JUST_SUMMONED] = 'Called when the creature or gameobject has just been summoned';

// SMART_EVENT_WAYPOINT_PAUSED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_PAUSED] = 'On waypoint paused';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_PAUSED] = 'PointId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_PAUSED] = 'PathId';

// SMART_EVENT_WAYPOINT_RESUMED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_RESUMED] = 'On waypoint resumed';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_RESUMED] = 'PointId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_RESUMED] = 'PathId';

// SMART_EVENT_WAYPOINT_STOPPED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_STOPPED] = 'On waypoint stopped';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_STOPPED] = 'PointId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_STOPPED] = 'PathId';

// SMART_EVENT_WAYPOINT_ENDED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_ENDED] = 'On waypoint ended';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_ENDED] = 'PointId';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_ENDED] = 'PathId';

// SMART_EVENT_TIMED_EVENT_TRIGGERED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TIMED_EVENT_TRIGGERED] = 'Called when a timed event called by the action CREATE_TIMED_EVENT is triggered';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TIMED_EVENT_TRIGGERED] = 'Event id';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.TIMED_EVENT_TRIGGERED] = 'First parameter of SMART_ACTION_CREATE_TIMED_EVENT';

// SMART_EVENT_UPDATE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE] = 'On update, should be used as a timer. Basically functions like both UPDATE_IC and UPDATE_OOC in one.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.UPDATE] = 'InitialMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.UPDATE] = 'InitialMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.UPDATE] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.UPDATE] = 'RepeatMax';

// SMART_EVENT_LINK
SAI_EVENT_TOOLTIPS[SAI_EVENTS.LINK] = 'On link';

// SMART_EVENT_GOSSIP_SELECT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GOSSIP_SELECT] = 'Called on gossip option selected. Imagine you have four gossip items under the menu id 5 and their id\'s are 0, 1 and 2. If you now call this event with first parameter \'5\' and second parameter \'1\', it will be called when the second gossip option is selected. Tables gossip_menu_option and gossip_menu.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GOSSIP_SELECT] = 'Gossip menu id';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.GOSSIP_SELECT] = 'Gossip item id';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.GOSSIP_SELECT] = 'This is the gossip_menu.entry identifier';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.GOSSIP_SELECT] = 'This is the gossip_menu_option.id identifier';

// SMART_EVENT_JUST_CREATED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.JUST_CREATED] = 'On gameobject just created (so when it spawns for the first time)';

// SMART_EVENT_GOSSIP_HELLO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GOSSIP_HELLO] = 'On gossip menu opened. Also called for gameobjects that just got \'opened\' by a player.';

// SMART_EVENT_FOLLOW_COMPLETED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FOLLOW_COMPLETED] = 'On follow completed/finished';

// SMART_EVENT_IS_BEHIND_TARGET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.IS_BEHIND_TARGET] = 'On behind target within a certain cooldown time';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.IS_BEHIND_TARGET] = 'CooldownMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.IS_BEHIND_TARGET] = 'CooldownMax';

// SMART_EVENT_GAME_EVENT_START
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GAME_EVENT_START] = 'On game event entry just started';


// SMART_EVENT_GAME_EVENT_END
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GAME_EVENT_END] = 'On game event entry just ended';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GAME_EVENT_END] = 'Game event entry';

// SMART_EVENT_GO_STATE_CHANGED
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GO_STATE_CHANGED] = 'On gameobject state changed.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GO_STATE_CHANGED] = 'Gameobject state';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.GO_STATE_CHANGED] = 'The new state of the gameobject after this event';

// SMART_EVENT_GO_EVENT_INFORM
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GO_EVENT_INFORM] = 'Called when the gameobject becomes the target of an event happening. This is called in cases like a building is damaged/destroyed/rebuild, a goober is used, etc.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GO_EVENT_INFORM] = 'Event id';

// SMART_EVENT_ACTION_DONE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.ACTION_DONE] = 'Called on a certain action id \'done\'. Those can only be called from core scripts (SmartAI::DoAction).';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.ACTION_DONE] = 'Action id';

// SMART_EVENT_ON_SPELLCLICK
SAI_EVENT_TOOLTIPS[SAI_EVENTS.ON_SPELLCLICK] = 'On unit spellclick. For more information on what spellclicks are, take a look at the wiki and search for the table \'npc_spellclick_spells\' (world database).';

// SMART_EVENT_FRIENDLY_HEALTH_PCT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'When a friendly unit within a certain range reaches a certain health percentage (so NOT flat health!). If you are looking for a flat modifier, use event type 14.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'Health pct min';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'Health pct max';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'RepeatMin';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'RepeatMax';

// SMART_EVENT_DISTANCE_CREATURE
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DISTANCE_CREATURE] = 'Event triggered when a creature with a specific guid or entry coems within a given distance (in yards) of the source.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'Guid';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'Entry';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'Distance';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'RepeatTimer';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.DISTANCE_CREATURE] = 'Guid of the creature we want to check for. Can be left on 0 if the entry is given.';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.DISTANCE_CREATURE] = 'Entry of the creature we want to check for. Can be left on 0 if the guid is given.';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.DISTANCE_CREATURE] = 'Min distance to the creature that\'ll make the event trigger';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.DISTANCE_CREATURE] = 'Timer to check for distance. It\'s not a good idea to leave this at 0, having a handful of events doing that can slow down your core big time.';

// SMART_EVENT_DISTANCE_GAMEOBJECT
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Event triggered when a gameobject with a specific guid or entry coems within a given distance (in yards) of the source.';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Guid';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Entry';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Distance';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'RepeatTimer';
SAI_EVENT_PARAM1_TOOLTIPS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Guid of the gameobject we want to check for. Can be left on 0 if the entry is given.';
SAI_EVENT_PARAM2_TOOLTIPS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Entry of the gameobject we want to check for. Can be left on 0 if the guid is given.';
SAI_EVENT_PARAM3_TOOLTIPS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Min distance to the gameobject that\'ll make the event trigger';
SAI_EVENT_PARAM4_TOOLTIPS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Timer to check for distance. It\'s not a good idea to leave this at 0, having a handful of events doing that can slow down your core big time.';

// SMART_EVENT_COUNTER_SET
SAI_EVENT_TOOLTIPS[SAI_EVENTS.COUNTER_SET] = 'If the value of specified counterID (param1) is equal to a specified value';
