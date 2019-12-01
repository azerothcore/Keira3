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

// 12
// 14
// 16
// 18
// 23
// 24
// 26
// 31
// 32
// 33
// 38
// 53
// 60

export const SAI_EVENTS_KEYS = getEnumKeys(SAI_EVENTS);
export const SAI_EVENT_TOOLTIPS = [];
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE_IC] = 'While in combat. Parameters represent a timer: 1000,2000,4000,4000 will call this event_type randomly between 1 and 2 seconds and repeat this every 4 seconds';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE_OOC] = 'While out of combat. Parameters represent a timer: 1000,2000,4000,4000 will call this event_type randomly between 1 and 2 seconds and repeat this every 4 seconds';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.HEALTH_PCT] = 'At health percentage. First and second parameters function as min-max health percentage values, so if they are  50,80, the event will be called when the source is between 50% and 80% health. The last two parameters are repeat timers in milliseconds.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.MANA_PCT] = 'At mana percentage. First and second parameters function as min-max mana percentage values, so if they are  50,80, the event will be called when the source is between 50% and 80% mana. The last two parameters are repeat timers in milliseconds.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AGGRO] = 'When the creature enters combat';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.KILL] = 'When the creature killed something';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DEATH] = 'When the creature just died';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.EVADE] = 'When the creature evades out of combat';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SPELLHIT] = 'On creature struck by a spell id';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RANGE] = 'When the creature is within a certain range of our target type';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.OOC_LOS] = 'When the creature detects movement of an unit that is within line of sight while the creature is out of combat. This should be used when attempting to trigger an action when a player or so moves within a distance of some place/trigger.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RESPAWN] = 'When the creature or gameobject respawns or spawns';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TARGET_HEALTH_PCT] = 'When the target of the creature is at a certain health percentage';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.VICTIM_CASTING] = 'When the target of the creature is casting a spell. Leaving the third parameter at 0 will mean any spell the target casts will trigger this event.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_HEALTH] = 'When a friendly unit within a certain range reaches a certain amount of health (NOT PERCENTAGE!). If you are looking for percentage, use event type 74.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_IS_CC] = 'When a friendly unit within a certain range is under the effect of a crowd control spell';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'When a friendly unit within a certain range is missing or having an aura/spell on them. If the first parameter is the spellid in a negative format, it will mean the event is triggered when a friendly unit within a certain range HAS a buff.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SUMMONED_UNIT] = 'When we summoned a creature with a certain entry. First parameter is the creature entry and if it\'s left at 0 it means we trigger this for any creature.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TARGET_MANA_PCT] = 'When the target of the creature is at a certain mana percentage';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.ACCEPTED_QUEST] = 'When the creature successfully offered a quest to a player';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.REWARD_QUEST] = 'When the creature successfully rewarded a quest of a player';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.REACHED_HOME] = 'When the creature reached its home position';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RECEIVE_EMOTE] = 'When the creature receives an emote';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.HAS_AURA] = 'When the creature is missing or having an aura/spell on them. If the first parameter is the spellid in a negative format, it will mean the event is triggered when a friendly unit within a certain range is MISSING a buff.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TARGET_BUFFED] = 'When the creature\'s target is missing or having an aura/spell on them. If the first parameter is the spellid in a negative format, it will mean the event is triggered when a friendly unit within a certain range is MISSING a buff.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RESET] = 'When the creature resets (evades, respawns, spawns or resets out of combat)';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.IC_LOS] = 'When the creature detects movement of an unit that is within line of sight while the creature is in combat. This should be used when attempting to trigger an action when a player or so moves within a distance of some place/trigger.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.PASSENGER_BOARDED] = 'When a passenger is boarded';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.PASSENGER_REMOVED] = 'When a passenger is removed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.CHARMED] = 'On creature charmed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.CHARMED_TARGET] = 'On target charmed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SPELLHIT_TARGET] = 'On target spellhit by a spell';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DAMAGED] = 'On creature damaged for a certain amount';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DAMAGED_TARGET] = 'On target damaged for a certain amount';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.MOVEMENTINFORM] = 'On movement inform. Useful when for example you want your creature to do something after it moving to a certain spot by using SMART_ACTION_MOVE_TO.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SUMMON_DESPAWNED] = 'On summoned unit despawned';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.CORPSE_REMOVED] = 'On creature corpse removal';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AI_INIT] = 'On AI initialization, so when the creature spawns (not when it respawns, resets or evades!)';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DATA_SET] = 'On data set, called after SMART_ACTION_SET_DATA is called to this source with a certain field and a certain value.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_START] = 'On waypoint started';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_REACHED] = 'On waypoint reached';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_ADDPLAYER] = 'TRANSPORT_ADDPLAYER'; // TODO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_ADDCREATURE] = 'TRANSPORT_ADDCREATURE'; // TODO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_REMOVE_PLAYER] = 'TRANSPORT_REMOVE_PLAYER'; // TODO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TRANSPORT_RELOCATE] = 'TRANSPORT_RELOCATE'; // TODO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.INSTANCE_PLAYER_ENTER] = 'INSTANCE_PLAYER_ENTER'; // TODO
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AREATRIGGER_ONTRIGGER] = 'On areatrigger reached by a player';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_ACCEPTED] = 'On target quest accepted';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_OBJ_COPLETETION] = 'On target quest objective completed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_COMPLETION] = 'On target quest completed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_REWARDED] = 'On target quest rewarded';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.QUEST_FAIL] = 'On target quest failed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TEXT_OVER] = 'When a creature says something it shows a balloon for a few seconds. This event is triggered after the balloon fades and thus the text \'finishes\'.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RECEIVE_HEAL] = 'On creature received a certain heal amount';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.JUST_SUMMONED] = 'Called when the creature or gameobject has just been summoned';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_PAUSED] = 'On waypoint paused';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_RESUMED] = 'On waypoint resumed';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_STOPPED] = 'On waypoint stopped';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.WAYPOINT_ENDED] = 'On waypoint ended';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.TIMED_EVENT_TRIGGERED] = 'Called when a timed event called by the action CREATE_TIMED_EVENT is triggered';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE] = 'On update, should be used as a timer. Basically functions like both UPDATE_IC and UPDATE_OOC in one.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.LINK] = 'On link';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GOSSIP_SELECT] = 'Called on gossip option selected. Imagine you have four gossip items under the menu id 5 and their id\'s are 0, 1 and 2. If you now call this event with first parameter \'5\' and second parameter \'1\', it will be called when the second gossip option is selected. Tables gossip_menu_option and gossip_menu.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.JUST_CREATED] = 'On gameobject just created (so when it spawns for the first time)';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GOSSIP_HELLO] = 'On gossip menu opened. Also called for gameobjects that just got \'opened\' by a player.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FOLLOW_COMPLETED] = 'On follow completed/finished';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.IS_BEHIND_TARGET] = 'On behind target within a certain cooldown time';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GAME_EVENT_START] = 'On game event entry just started';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GAME_EVENT_END] = 'On game event entry just ended';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GO_STATE_CHANGED] = 'On gameobject state changed.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.GO_EVENT_INFORM] = 'Called when the gameobject becomes the target of an event happening. This is called in cases like a building is damaged/destroyed/rebuild, a goober is used, etc.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.ACTION_DONE] = 'Called on a certain action id \'done\'. Those can only be called from core scripts (SmartAI::DoAction).';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.ON_SPELLCLICK] = 'On unit spellclick. For more information on what spellclicks are, take a look at the wiki and search for the table \'npc_spellclick_spells\' (world database).';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'When a friendly unit within a certain range reaches a certain health percentage (so NOT flat health!). If you are looking for a flat modifier, use event type 14.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DISTANCE_CREATURE] = 'Event triggered when a creature with a specific guid or entry coems within a given distance (in yards) of the source.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Event triggered when a gameobject with a specific guid or entry coems within a given distance (in yards) of the source.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.COUNTER_SET] = 'If the value of specified counterID (param1) is equal to a specified value';
// TODO: add missing values

export const SAI_EVENT_PARAM1_NAMES = [];
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.UPDATE_IC] = 'InitialMin';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.UPDATE_OOC] = 'InitialMin';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.HEALTH_PCT] = 'Min health pct';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.MANA_PCT] = 'Min mana pct';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.KILL] = 'Cooldown min';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SPELLHIT] = 'Spell id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RANGE] = 'Min distance to target';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.OOC_LOS] = 'Ignore hostile targets (0/1)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RESPAWN] = 'Respawn condition';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'Health pct min';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.VICTIM_CASTING] = 'RepeatMin';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'Health deficit (flat)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_IS_CC] = 'Radius';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'Spellid';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SUMMONED_UNIT] = 'Creature id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'Mana pct min';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.ACCEPTED_QUEST] = 'Quest id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.REWARD_QUEST] = 'Quest id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RECEIVE_EMOTE] = 'Emote id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.HAS_AURA] = 'Spell id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'Spell id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.IC_LOS] = 'Ignore hostile targets (0/1)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'Spell id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DAMAGED] = 'Minimum damage';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'Minimum damage';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.MOVEMENTINFORM] = 'Movement type (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.SUMMON_DESPAWNED] = 'Creature entry (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DATA_SET] = 'Field';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_START] = 'Point id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_REACHED] = 'Point id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.AREATRIGGER_ONTRIGGER] = 'Areatrigger id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TEXT_OVER] = 'Group id (creature_text)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'Minimum heal';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_PAUSED] = 'Point id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_RESUMED] = 'Point id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_STOPPED] = 'Point id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.WAYPOINT_ENDED] = 'Point id (0 any)';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.TIMED_EVENT_TRIGGERED] = 'Event id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.UPDATE] = 'InitialMin';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GOSSIP_SELECT] = 'Gossip menu id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.IS_BEHIND_TARGET] = 'CooldownMin';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GAME_EVENT_START] = 'Game event entry';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GAME_EVENT_END] = 'Game event entry';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GO_STATE_CHANGED] = 'Gameobject state';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.GO_EVENT_INFORM] = 'Event id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.ACTION_DONE] = 'Action id';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'Health pct min';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'Guid';
SAI_EVENT_PARAM1_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Guid';
// TODO: add missing values

export const SAI_EVENT_PARAM2_NAMES = [];
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.UPDATE_IC] = 'InitialMax';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.UPDATE_OOC] = 'InitialMax';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.HEALTH_PCT] = 'Max health pct';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.MANA_PCT] = 'Max mana pct';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.KILL] = 'Cooldown max';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SPELLHIT] = 'Spell school (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RANGE] = 'Max distance to target';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.OOC_LOS] = 'Max distance to target';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RESPAWN] = 'Map id condition';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'Health pct max';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.VICTIM_CASTING] = 'RepeatMax';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'Radius';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_IS_CC] = 'RepeatMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'Radius';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SUMMONED_UNIT] = 'RepeatMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'Mana pct max';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RECEIVE_EMOTE] = 'RepeatMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.HAS_AURA] = 'Stacks';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'Stacks';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.IC_LOS] = 'Max distance to target';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'Spell school';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DAMAGED] = 'Maximum damage';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'Maximum damage';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.MOVEMENTINFORM] = 'Point id';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.SUMMON_DESPAWNED] = 'CooldownMin';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DATA_SET] = 'Value';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_START] = 'Path id (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_REACHED] = 'Path id (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.TEXT_OVER] = 'Creature entry (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'Maximum heal';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_PAUSED] = 'Path id (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_RESUMED] = 'Path id (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_STOPPED] = 'Path id (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.WAYPOINT_ENDED] = 'Path id (0 any)';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.UPDATE] = 'InitialMax';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.GOSSIP_SELECT] = 'Gossip item id';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.IS_BEHIND_TARGET] = 'CooldownMax';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'Health pct max';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'Entry';
SAI_EVENT_PARAM2_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Entry';
// TODO: add missing values

export const SAI_EVENT_PARAM3_NAMES = [];
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.UPDATE_IC] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.UPDATE_OOC] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.HEALTH_PCT] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.MANA_PCT] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.KILL] = 'Player only (0/1)';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SPELLHIT] = 'CooldownMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RANGE] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.OOC_LOS] = 'Cooldown min';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RESPAWN] = 'Zone id condition';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.VICTIM_CASTING] = 'Spell id';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_IS_CC] = 'RepeatMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SUMMONED_UNIT] = 'RepeatMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RECEIVE_EMOTE] = 'RepeatMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.HAS_AURA] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.IC_LOS] = 'Cooldown min';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DAMAGED] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.SUMMON_DESPAWNED] = 'CooldownMax';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DATA_SET] = 'CooldownMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'CooldownMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.UPDATE] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'RepeatMin';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'Distance';
SAI_EVENT_PARAM3_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'Distance';
// TODO: add missing values

export const SAI_EVENT_PARAM4_NAMES = [];
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.UPDATE_IC] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.UPDATE_OOC] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.HEALTH_PCT] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.MANA_PCT] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.KILL] = 'Entry (if param3 is 0)';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.SPELLHIT] = 'CooldownMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.RANGE] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.OOC_LOS] = 'Cooldown max';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.TARGET_HEALTH_PCT] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.FRIENDLY_HEALTH] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.TARGET_MANA_PCT] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.HAS_AURA] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.TARGET_BUFFED] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.IC_LOS] = 'Cooldown max';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.SPELLHIT_TARGET] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DAMAGED] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DAMAGED_TARGET] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DATA_SET] = 'CooldownMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.RECEIVE_HEAL] = 'CooldownMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.UPDATE] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = 'RepeatMax';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DISTANCE_CREATURE] = 'RepeatTimer';
SAI_EVENT_PARAM4_NAMES[SAI_EVENTS.DISTANCE_GAMEOBJECT] = 'RepeatTimer';
// TODO: add missing values

export const SAI_EVENT_PARAM1_TOOLTIPS = [];
// TODO: add missing values

export const SAI_EVENT_PARAM2_TOOLTIPS = [];
// TODO: add missing values

export const SAI_EVENT_PARAM3_TOOLTIPS = [];
// TODO: add missing values

export const SAI_EVENT_PARAM4_TOOLTIPS = [];
// TODO: add missing values

