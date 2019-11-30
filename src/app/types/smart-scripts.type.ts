import { TableRow } from './general';
import { getEnumKeys } from '../utils/helpers';

export const SAI_TABLE = 'smart_scripts';

export const SAI_ID_FIELDS = [
  'entryorguid',
  'source_type',
];
export const SAI_ID_2 = 'id';
export const SAI_SEARCH_FIELDS = SAI_ID_FIELDS;

export enum SAI_SEARCH_TYPES {
  SAI_TYPE_CREATURE,
  SAI_TYPE_GAMEOBJECT,
  SAI_TYPE_AREATRIGGER,
  SAI_TYPE_TIMED_ACTIONLIST = 9,
}
export const SAI_SEARCH_TYPES_KEYS = getEnumKeys(SAI_SEARCH_TYPES);

export class SmartScripts extends TableRow {
  entryorguid: number = 0;
  source_type: number = 0;
  id: number = 0;
  link: number = 0;
  event_type: number = 0;
  event_phase_mask: number = 0;
  event_chance: number = 100;
  event_flags: number = 0;
  event_param1: number = 0;
  event_param2: number = 0;
  event_param3: number = 0;
  event_param4: number = 0;
  event_param5: number = 0;
  action_type: number = 0;
  action_param1: number = 0;
  action_param2: number = 0;
  action_param3: number = 0;
  action_param4: number = 0;
  action_param5: number = 0;
  action_param6: number = 0;
  target_type: number = 0;
  target_param1: number = 0;
  target_param2: number = 0;
  target_param3: number = 0;
  target_param4: number = 0;
  target_x: number = 0;
  target_y: number = 0;
  target_z: number = 0;
  target_o: number = 0;
  comment: string = '';
}

export enum SAI_EVENTS {
  UPDATE_IC                = 0,
  UPDATE_OOC               = 1,
  HEALTH_PCT               = 2,
  MANA_PCT                 = 3,
  AGGRO                    = 4,
  KILL                     = 5,
  DEATH                    = 6,
  EVADE                    = 7,
  SPELLHIT                 = 8,
  RANGE                    = 9,
  OOC_LOS                  = 10,
  RESPAWN                  = 11,
  TARGET_HEALTH_PCT        = 12,
  VICTIM_CASTING           = 13,
  FRIENDLY_HEALTH          = 14,
  FRIENDLY_IS_CC           = 15,
  FRIENDLY_MISSING_BUFF    = 16,
  SUMMONED_UNIT            = 17,
  TARGET_MANA_PCT          = 18,
  ACCEPTED_QUEST           = 19,
  REWARD_QUEST             = 20,
  REACHED_HOME             = 21,
  RECEIVE_EMOTE            = 22,
  HAS_AURA                 = 23,
  TARGET_BUFFED            = 24,
  RESET                    = 25,
  IC_LOS                   = 26,
  PASSENGER_BOARDED        = 27,
  PASSENGER_REMOVED        = 28,
  CHARMED                  = 29,
  CHARMED_TARGET           = 30,
  SPELLHIT_TARGET          = 31,
  DAMAGED                  = 32,
  DAMAGED_TARGET           = 33,
  MOVEMENTINFORM           = 34,
  SUMMON_DESPAWNED         = 35,
  CORPSE_REMOVED           = 36,
  AI_INIT                  = 37,
  DATA_SET                 = 38,
  WAYPOINT_START           = 39,
  WAYPOINT_REACHED         = 40,
  TRANSPORT_ADDPLAYER      = 41,
  TRANSPORT_ADDCREATURE    = 42,
  TRANSPORT_REMOVE_PLAYER  = 43,
  TRANSPORT_RELOCATE       = 44,
  INSTANCE_PLAYER_ENTER    = 45,
  AREATRIGGER_ONTRIGGER    = 46,
  QUEST_ACCEPTED           = 47,
  QUEST_OBJ_COPLETETION    = 48,
  QUEST_COMPLETION         = 49,
  QUEST_REWARDED           = 50,
  QUEST_FAIL               = 51,
  TEXT_OVER                = 52,
  RECEIVE_HEAL             = 53,
  JUST_SUMMONED            = 54,
  WAYPOINT_PAUSED          = 55,
  WAYPOINT_RESUMED         = 56,
  WAYPOINT_STOPPED         = 57,
  WAYPOINT_ENDED           = 58,
  TIMED_EVENT_TRIGGERED    = 59,
  UPDATE                   = 60,
  LINK                     = 61,
  GOSSIP_SELECT            = 62,
  JUST_CREATED             = 63,
  GOSSIP_HELLO             = 64,
  FOLLOW_COMPLETED         = 65,
  // UNUSED_66                = 66, // unused
  IS_BEHIND_TARGET         = 67,
  GAME_EVENT_START         = 68,
  GAME_EVENT_END           = 69,
  GO_STATE_CHANGED         = 70,
  GO_EVENT_INFORM          = 71,
  ACTION_DONE              = 72,
  ON_SPELLCLICK            = 73,
  FRIENDLY_HEALTH_PCT      = 74,
  DISTANCE_CREATURE        = 75,
  DISTANCE_GAMEOBJECT      = 76,
  COUNTER_SET              = 77,
}
export const SAI_EVENTS_KEYS = getEnumKeys(SAI_EVENTS);

export enum SAI_ACTIONS {
  NONE                               = 0,
  TALK                               = 1,
  SET_FACTION                        = 2,
  MORPH_TO_ENTRY_OR_MODEL            = 3,
  SOUND                              = 4,
  PLAY_EMOTE                         = 5,
  FAIL_QUEST                         = 6,
  OFFER_QUEST                        = 7,
  SET_REACT_STATE                    = 8,
  ACTIVATE_GOBJECT                   = 9,
  RANDOM_EMOTE                       = 10,
  CAST                               = 11,
  SUMMON_CREATURE                    = 12,
  THREAT_SINGLE_PCT                  = 13,
  THREAT_ALL_PCT                     = 14,
  CALL_AREAEXPLOREDOREVENTHAPPENS    = 15,
  RESERVED_16                        = 16,
  SET_EMOTE_STATE                    = 17,
  SET_UNIT_FLAG                      = 18,
  REMOVE_UNIT_FLAG                   = 19,
  AUTO_ATTACK                        = 20,
  ALLOW_COMBAT_MOVEMENT              = 21,
  SET_EVENT_PHASE                    = 22,
  INC_EVENT_PHASE                    = 23,
  EVADE                              = 24,
  FLEE_FOR_ASSIST                    = 25,
  CALL_GROUPEVENTHAPPENS             = 26,
  COMBAT_STOP                        = 27,
  REMOVEAURASFROMSPELL               = 28,
  FOLLOW                             = 29,
  RANDOM_PHASE                       = 30,
  RANDOM_PHASE_RANGE                 = 31,
  RESET_GOBJECT                      = 32,
  CALL_KILLEDMONSTER                 = 33,
  SET_INST_DATA                      = 34,
  SET_INST_DATA64                    = 35,
  UPDATE_TEMPLATE                    = 36,
  DIE                                = 37,
  SET_IN_COMBAT_WITH_ZONE            = 38,
  CALL_FOR_HELP                      = 39,
  SET_SHEATH                         = 40,
  FORCE_DESPAWN                      = 41,
  SET_INVINCIBILITY_HP_LEVEL         = 42,
  MOUNT_TO_ENTRY_OR_MODEL            = 43,
  SET_INGAME_PHASE_MASK              = 44,
  SET_DATA                           = 45,
  MOVE_FORWARD                       = 46,
  SET_VISIBILITY                     = 47,
  SET_ACTIVE                         = 48,
  ATTACK_START                       = 49,
  SUMMON_GO                          = 50,
  KILL_UNIT                          = 51,
  ACTIVATE_TAXI                      = 52,
  WP_START                           = 53,
  WP_PAUSE                           = 54,
  WP_STOP                            = 55,
  ADD_ITEM                           = 56,
  REMOVE_ITEM                        = 57,
  INSTALL_AI_TEMPLATE                = 58,
  SET_RUN                            = 59,
  SET_FLY                            = 60,
  SET_SWIM                           = 61,
  TELEPORT                           = 62,
  SET_COUNTER                        = 63,
  STORE_TARGET_LIST                  = 64,
  WP_RESUME                          = 65,
  SET_ORIENTATION                    = 66,
  CREATE_TIMED_EVENT                 = 67,
  PLAYMOVIE                          = 68,
  MOVE_TO_POS                        = 69,
  RESPAWN_TARGET                     = 70,
  EQUIP                              = 71,
  CLOSE_GOSSIP                       = 72,
  TRIGGER_TIMED_EVENT                = 73,
  REMOVE_TIMED_EVENT                 = 74,
  ADD_AURA                           = 75,
  OVERRIDE_SCRIPT_BASE_OBJECT        = 76,
  RESET_SCRIPT_BASE_OBJECT           = 77,
  CALL_SCRIPT_RESET                  = 78,
  SET_RANGED_MOVEMENT                = 79,
  CALL_TIMED_ACTIONLIST              = 80,
  SET_NPC_FLAG                       = 81,
  ADD_NPC_FLAG                       = 82,
  REMOVE_NPC_FLAG                    = 83,
  SIMPLE_TALK                        = 84,
  INVOKER_CAST                       = 85,
  CROSS_CAST                         = 86,
  CALL_RANDOM_TIMED_ACTIONLIST       = 87,
  CALL_RANDOM_RANGE_TIMED_ACTIONLIST = 88,
  RANDOM_MOVE                        = 89,
  SET_UNIT_FIELD_BYTES_1             = 90,
  REMOVE_UNIT_FIELD_BYTES_1          = 91,
  INTERRUPT_SPELL                    = 92,
  SEND_GO_CUSTOM_ANIM                = 93,
  SET_DYNAMIC_FLAG                   = 94,
  ADD_DYNAMIC_FLAG                   = 95,
  REMOVE_DYNAMIC_FLAG                = 96,
  JUMP_TO_POS                        = 97,
  SEND_GOSSIP_MENU                   = 98,
  GO_SET_LOOT_STATE                  = 99,
  SEND_TARGET_TO_TARGET              = 100,
  SET_HOME_POS                       = 101,
  SET_HEALTH_REGEN                   = 102,
  SET_ROOT                           = 103,
  SET_GO_FLAG                        = 104,
  ADD_GO_FLAG                        = 105,
  REMOVE_GO_FLAG                     = 106,
  SUMMON_CREATURE_GROUP              = 107,
  SET_POWER                          = 108,
  ADD_POWER                          = 109,
  REMOVE_POWER                       = 110,
  GAME_EVENT_STOP                    = 111,
  GAME_EVENT_START                   = 112,
  START_CLOSEST_WAYPOINT             = 113,
  RISE_UP                            = 114,
  RANDOM_SOUND                       = 115,
  // SET_CORPSE_DELAY                   = 116, //  NOT SUPPORTED YET
  // DISABLE_EVADE                      = 117, //  NOT SUPPORTED YET
  // GO_SET_GO_STATE                    = 118, //  NOT SUPPORTED YET
  // SET_CAN_FLY                        = 119, //  NOT SUPPORTED YET
  // REMOVE_AURAS_BY_TYPE               = 120, //  NOT SUPPORTED YET
  SET_SIGHT_DIST                     = 121,
  FLEE                               = 122,
  ADD_THREAT                         = 123,
  LOAD_EQUIPMENT                     = 124,
  TRIGGER_RANDOM_TIMED_EVENT         = 125,
  REMOVE_ALL_GAMEOBJECTS             = 126,
  // REMOVE_MOVEMENT                    = 127, // NOT SUPPORTED YET
  // PLAY_ANIMKIT                       = 128, // don't use on 3.3.5a
  // SCENE_PLAY                         = 129, // don't use on 3.3.5a
  // SCENE_CANCEL                       = 130, // don't use on 3.3.5a
  // SPAWN_SPAWNGROUP                   = 131, // NOT SUPPORTED YET
  // DESPAWN_SPAWNGROUP                 = 132, // NOT SUPPORTED YET
  // RESPAWN_BY_SPAWNID                 = 133, // NOT SUPPORTED YET
  // INVOKER_CAST                       = 134, // name conflicts

  // AC-only SmartActions:
  MOVE_TO_POS_TARGET                 = 201,
  SET_GO_STATE                       = 202,
  EXIT_VEHICLE                       = 203,
  SET_UNIT_MOVEMENT_FLAGS            = 204,
  SET_COMBAT_DISTANCE                = 205,
  SET_CASTER_COMBAT_DIST             = 206,
  SET_HOVER                          = 207,
  ADD_IMMUNITY                       = 208,
  REMOVE_IMMUNITY                    = 209,
  FALL                               = 210,
  SET_EVENT_FLAG_RESET               = 211,
  STOP_MOTION                        = 212,
  NO_ENVIRONMENT_UPDATE              = 213,
  ZONE_UNDER_ATTACK                  = 214,
  LOAD_GRID                          = 215,
  MUSIC                              = 216,
  RANDOM_MUSIC                       = 217,
}
export const SAI_ACTIONS_KEYS = getEnumKeys(SAI_ACTIONS);

export enum SAI_TARGETS {
  NONE                           = 0,
  SELF                           = 1,
  VICTIM                         = 2,
  HOSTILE_SECOND_AGGRO           = 3,
  HOSTILE_LAST_AGGRO             = 4,
  HOSTILE_RANDOM                 = 5,
  HOSTILE_RANDOM_NOT_TOP         = 6,
  ACTION_INVOKER                 = 7,
  POSITION                       = 8,
  CREATURE_RANGE                 = 9,
  CREATURE_GUID                  = 10,
  CREATURE_DISTANCE              = 11,
  STORED                         = 12,
  GAMEOBJECT_RANGE               = 13,
  GAMEOBJECT_GUID                = 14,
  GAMEOBJECT_DISTANCE            = 15,
  INVOKER_PARTY                  = 16,
  PLAYER_RANGE                   = 17,
  PLAYER_DISTANCE                = 18,
  CLOSEST_CREATURE               = 19,
  CLOSEST_GAMEOBJECT             = 20,
  CLOSEST_PLAYER                 = 21,
  ACTION_INVOKER_VEHICLE         = 22,
  OWNER_OR_SUMMONER              = 23,
  THREAT_LIST                    = 24,
  CLOSEST_ENEMY                  = 25,
  CLOSEST_FRIENDLY               = 26,
  // LOOT_RECIPIENTS                = 27,   // NOT SUPPORTED YET
  FARTHEST                       = 28,
  // VEHICLE_PASSENGER              = 29,   // NOT SUPPORTED YET
}
export const SAI_TARGETS_KEYS = getEnumKeys(SAI_TARGETS);

export const SAI_EVENT_TOOLTIPS = [];
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE_IC]  = 'While in combat. Parameters represent a timer: 1000,2000,4000,4000 will call this event_type randomly between 1 and 2 seconds and repeat this every 4 seconds';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.UPDATE_OOC]  = 'While out of combat. Parameters represent a timer: 1000,2000,4000,4000 will call this event_type randomly between 1 and 2 seconds and repeat this every 4 seconds';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.HEALTH_PCT]  = 'At health percentage. First and second parameters function as min-max health percentage values, so if they are  50,80, the event will be called when the source is between 50% and 80% health. The last two parameters are repeat timers in milliseconds.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.MANA_PCT]  = 'At mana percentage. First and second parameters function as min-max mana percentage values, so if they are  50,80, the event will be called when the source is between 50% and 80% mana. The last two parameters are repeat timers in milliseconds.';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.AGGRO]  = 'When the creature enters combat';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.KILL]  = 'When the creature killed something';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.DEATH]  = 'When the creature just died';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.EVADE]  = 'When the creature evades out of combat';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.SPELLHIT]  = 'On creature struck by a spell id';
SAI_EVENT_TOOLTIPS[SAI_EVENTS.RANGE]  = 'When the creature is within a certain range of our target type';
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

export const SAI_ACTION_TOOLTIPS = [];
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.NONE] = 'No action type is specified. Do not use because it will cause errors on start-up.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.TALK] = 'Creature says a creature_text line';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_FACTION] = 'Set faction of target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL] = 'Morph the creature to an entry or modelid. If both parameters are 0, this will demorph the creature';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SOUND] = 'Play a sound id';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.PLAY_EMOTE] = 'Play en emote';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.FAIL_QUEST] = 'Set a certain quest of our (player) target to \'fail\', making them have to re-take it';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.OFFER_QUEST] = 'Add a quest to our (player) target\'s quest list';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_REACT_STATE] = 'Set our reactstate (0 = passive, 1 = defensive, 2 = aggressive)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ACTIVATE_GOBJECT] = 'Activate a gameobject (targets our target_type, so it must be a gameobject)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RANDOM_EMOTE] = 'Play a random emote. Out of a total of 6 parameters it will pick one and ignore all fields with the value 0';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CAST] = 'Cast a spell to our target type';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SUMMON_CREATURE] = 'Summons a creature of a certain entry for a given time (or permanent, depending on the summon type which is set in the second parameter).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.THREAT_SINGLE_PCT] = 'Add or remove a certain percentage of threat from our current threat. Only one of the parameters (so either 1 or 2) may be used at the same time';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.THREAT_ALL_PCT] = 'Add or remove a certain percentage of threat from our current threat. Only one of the parameters (so either 1 or 2) may be used at the same time';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_AREAEXPLOREDOREVENTHAPPENS] = 'Complete a quest requirement (by entry) of our current (player) target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RESERVED_16] = 'Unused action type';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_EMOTE_STATE] = 'Set emote state';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_UNIT_FLAG] = 'Set the unit flags of the target (using creature_template.unit_flags and creature_template.unit_flags2)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_UNIT_FLAG] = 'Removes unit flags from the target (using creature_template.unit_flags and creature_template.unit_flags2)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.AUTO_ATTACK] = 'Start or stop attacking our target (start or stop is determined by first parameter).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT] = 'Allow or disallow moving while the creature is in combat';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_EVENT_PHASE] = 'Set the creature\'s event phasemask to a new value (warning: this is NOT the creature\'s actual phase!)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.INC_EVENT_PHASE] = 'Increment or decrement the creature\'s event phasemask (warning: this is NOT the creature\'s actual phase!)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.EVADE] = 'Makes the creature evade and therefore make it stop attacking and leave combat.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.FLEE_FOR_ASSIST] = 'Makes the creature flee for assistance of nearby friendly units';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_GROUPEVENTHAPPENS] = 'Complete a quest requirement (by entry) of our current (player) target.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.COMBAT_STOP] = 'Complete a quest requirement (by entry) of our current (player) target. Completes a killed monster credit as well as gives credit for a spellcast.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVEAURASFROMSPELL] = 'Remove an aura/spell from our target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.FOLLOW] = 'Makes the creature follow the target at a certain distance and with a certain angle.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RANDOM_PHASE] = 'Set the creature\'s event phase (warning: this is NOT the creature\'s actual phase!)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RANDOM_PHASE_RANGE] = 'Set the creature\'s event phase randomly between two values (this is NOT the creature\'s actual phase!)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RESET_GOBJECT] = 'Reset a gameobject, usually used to open/close a door (calls GameObject::ResetDoorOrButton).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_KILLEDMONSTER] = 'Gives a kill credit to our (player) target. The entry is the same entry as quest_template.RequiredNpcOrGo(1/2/3/4).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_INST_DATA] = 'Sets a certain instance data field to a specific value. This will be received and can be handled inside the InstanceScript of the instance we are sending this to (InstanceScripts are always written in C++).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_INST_DATA64] = 'Sets a certain instance data field to a specific value. This will be received and can be handled inside the InstanceScript of the instance we are sending this to (InstanceScripts are always written in C++).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.UPDATE_TEMPLATE] = 'Updates the creature\'s entry to a new one, making it become a completely different unit.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.DIE] = 'Instantly kills the target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_IN_COMBAT_WITH_ZONE] = 'Sets the creature in combat with its zone. Useful for bosses inside instances so all players will be set in combat until the fight ends.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_FOR_HELP] = 'Makes the creature cry/call for help which makes nearby creatures that are not yet in combat and are able to assist this creature, run to this creature and attack its attackers.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_SHEATH] = 'Set the sheathe state of the creature. The sheath state determines which weapon will be displayed on the model.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.FORCE_DESPAWN] = 'Despawns the creature/gameobject within a given time (in milliseconds).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL] = 'Sets the creature\'s invincibility health to a flat value or percentage. Either one of the parameters must be set (so not both), and you can not reverse this effect (both parameters at 0 will result in an error).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL] = 'Sets the mount model to the model given in the second parameter (or takes the model of the entry given in the first parameter). Only one parameter may be used at the same time.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_INGAME_PHASE_MASK] = 'Sets the ACTUAL phasemask of the creature. This is not the event phasemask, but the actual phasemask. Sets the phasemask column in the creature table in the world database.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_DATA] = 'Calls SMART_EVENT_DATA_SET with given field and data, making it possible to communicate between different entries.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.MOVE_FORWARD] = 'Move a set amount of yards forward from the current position';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_VISIBILITY] = 'Sets the visibility of the creature or gameobject';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_ACTIVE] = 'Sets whether or not the creature or gameobject is counted as \'active\'. When it\'s set to be \'active\', it means the grid this entity is spawned in is no longer able to become inactive.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ATTACK_START] = 'Makes the creature start attacking the first unit it finds on the target list.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SUMMON_GO] = 'Summon a gameobject entry';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.KILL_UNIT] = 'Kills the unit target instantly';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ACTIVATE_TAXI] = 'Activates a taxipath of the given id for our (player) target.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.WP_START] = 'Starts a waypoint using the `waypoints` table in the world database.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.WP_PAUSE] = 'Pauses the waypoint path the creature is currently following for a specific time (milliseconds).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.WP_STOP] = 'Stops the waypoint path the creature is currently following. Also allows you to specify a despawn time from that point on as well as which quest id should be counted as \'fail\' (or not, based on the third parameter).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_ITEM] = 'Adds a certain item entry a specific amount of times to our player target.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_ITEM] = 'Removes a certain item entry a specific amount of times to our player target.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.INSTALL_AI_TEMPLATE] = 'Installs a SmartAI template which are basically pre-defined scripts for scripts that are used in a lot of cases. Thing of casters with specific spells, passive, turrets, etc.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_RUN] = 'Sets running flag on or off.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_FLY] = 'Sets flying flag on or off.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_SWIM] = 'Sets swimming flag on or off.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.TELEPORT] = 'Teleport target to a specific map using coordinates in the target X/Y/Z/O fields. Note: May NOT use SMART_TARGET_POSITION (8)!';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_COUNTER] = 'Stores a decimal variable (number) under a variable id to store information for the creature during runtime.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.STORE_TARGET_LIST] = 'Stores a list of targets under a variable id so it can later be read again.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.WP_RESUME] = 'Resume the waypoint path the creature was previously following.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_ORIENTATION] = 'Sets the orientation of the creature to a given value. Must use SMART_TARGET_POSITION. If you, however, want the creature to face its spawn/home position, you can just use SMART_TARGET_SELF and leave all parameters at 0.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CREATE_TIMED_EVENT] = 'Calls SMART_EVENT_UPDATE after a specific time with given parameters.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.PLAYMOVIE] = 'Plays a movie of a given entry.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.MOVE_TO_POS] = 'Move to a given position using the target co-ordinate fields (target_x/target_y/target_z/target_o) with SMART_TARGET_POSITION. First parameter is an id which can be read using SMART_EVENT_MOVEMENTINFORM. Explanation in tooltip.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RESPAWN_TARGET] = 'Respawns the target. Only works for gameobject target. Action does not actually respawn the target, it just sets the respawn time of the target, but this is how gameobject respawning is handled.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.EQUIP] = 'Set the creature\'s equipment template to a certain entry. If no entry (first parameter) is set, it will set the three item entries which are ordered by slot (param3 is main-hand, param4 is off-hand, param5 is gun/bow/etc). The slotmask (param2) value is 0 by default and goes by bits, so if it\'s \'2\' it will only show the off-hand weapon (bits are 1, 2 and 4). Having 0 defaults to 7, so all slots.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CLOSE_GOSSIP] = 'Closes the currently opened gossip to our player target.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.TRIGGER_TIMED_EVENT] = 'Calls SMART_EVENT_TIMED_EVENT_TRIGGERED with a given id.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_TIMED_EVENT] = 'Interrupts the timed event called from SMART_ACTION_TRIGGER_TIMED_EVENT. 0 is NOT a proper value!';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_AURA] = 'Adds an aura to our target.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.OVERRIDE_SCRIPT_BASE_OBJECT] = 'Overrides the current creature\'s/gameobject\'s script to a new source using the targettype. If more than one target is specified, the first on the list will be used.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RESET_SCRIPT_BASE_OBJECT] = 'Resets the script of the source to its original state. Only useful after SMART_ACTION_OVERRIDE_SCRIPT_BASE_OBJECT was called (because we store the original guid when doing this).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_SCRIPT_RESET] = 'Calls SMART_EVENT_RESET (only calls this, doesn\'t actually reset the creature/gameobject).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_RANGED_MOVEMENT] = 'Sets the creature\'s attack distance and angle to chase its target with. The distance (first parameter) is the minimum distance it will keep away from its target during combat.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_TIMED_ACTIONLIST] = 'Calls a script for the source with a given entry.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_NPC_FLAG] = 'Set the npc flags of the target (using creature_template.npcflag)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_NPC_FLAG] = 'Adds npc flags of the target (using creature_template.npcflag)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_NPC_FLAG] = 'Removes npc flags of the target (using creature_template.npcflag)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SIMPLE_TALK] = 'Functions the same as SMART_ACTION_TALK, except that it makes the player target say it. Does NOT trigger SMART_EVENT_TEXT_OVER.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.INVOKER_CAST] = 'Make our action invoker type cast a spell to our target type';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CROSS_CAST] = 'Make the specified target type (in parameters) cast a spell to our target type';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_RANDOM_TIMED_ACTIONLIST] = 'Calls a random script for the source with given entries';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.CALL_RANDOM_RANGE_TIMED_ACTIONLIST] = 'Calls a random script between two values for the source with given entries. So if parameter 1 is 500 and parameter 2 is 550, a script will randomly be picked between 500 and 550.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RANDOM_MOVE] = 'Move randomly around within a given distance';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1] = 'Set the unit field bytes 1 flags of the target to a specific value';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_UNIT_FIELD_BYTES_1] = 'Removes specific unit field bytes 1 flags of the target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.INTERRUPT_SPELL] = 'Interrupt a given spell id (or any, if the second parameter is 0).';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SEND_GO_CUSTOM_ANIM] = 'Sends a custom gameobject animation from the target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_DYNAMIC_FLAG] = 'Sets the dynamic flags of the target to a specific value';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_DYNAMIC_FLAG] = 'Adds dynamic flags to the current value of the target';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_DYNAMIC_FLAG] = 'Removes specific dynamic flags of the target\'s current dynamic flags';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.JUMP_TO_POS] = 'Jump to a given position with a given speed. Must use SMART_TARGET_POSITION with this action_type.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SEND_GOSSIP_MENU] = 'Sends a specific gossip menu to a player which will then be opened for this player';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.GO_SET_LOOT_STATE] = 'Sets the gameobject\'s loot state to a given value';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SEND_TARGET_TO_TARGET] = 'Sends a stored target id to our given target type. The id comes from SMART_ACTION_STORE_TARGET and can be used with SMART_TARGET_STORED';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_HOME_POS] = 'Sets the home position of the source to a new position. The home position is the position the creature runs to when evading/reseting/etc. Uses the target type to determine the new home position.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_HEALTH_REGEN] = 'Turns the health regeneration of the creature on or off';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_ROOT] = 'Roots or unroots the creature (or player target)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_GO_FLAG] = 'Sets the gameobject\'s flags to a specific value';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_GO_FLAG] = 'Adds specific flags to the gameobject\'s flags field';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_GO_FLAG] = 'Removes specific flags from the gameobject\'s flags field';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SUMMON_CREATURE_GROUP] = 'Summon a set of creatures in once using the creature_summon_groups table in the world database.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_POWER] = 'Sets the value of a given power type to a specific value';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_POWER] = 'Adds a given value to a given power type';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_POWER] = 'Removes a given value from a given power type';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.GAME_EVENT_STOP] = 'Stops a game event with specified id (game_event.eventEntry)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.GAME_EVENT_START] = 'Starts a game event with specified id (game_event.eventEntry)';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.START_CLOSEST_WAYPOINT] = 'Starts moving by the closest waypoint it can find. Parameters allow to give up to 6 waypoint id\'s and it will start the closest.';
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RISE_UP] = 'RISE_UP'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RANDOM_SOUND] = 'RANDOM_SOUND'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_SIGHT_DIST] = 'SET_SIGHT_DIST'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.FLEE] = 'FLEE'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_THREAT] = 'ADD_THREAT'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.LOAD_EQUIPMENT] = 'LOAD_EQUIPMENT'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.TRIGGER_RANDOM_TIMED_EVENT] = 'TRIGGER_RANDOM_TIMED_EVENT'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_ALL_GAMEOBJECTS] = 'REMOVE_ALL_GAMEOBJECTS'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.MOVE_TO_POS_TARGET] = 'MOVE_TO_POS_TARGET'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_GO_STATE] = 'SET_GO_STATE'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.EXIT_VEHICLE] = 'EXIT_VEHICLE'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_UNIT_MOVEMENT_FLAGS] = 'SET_UNIT_MOVEMENT_FLAGS'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_COMBAT_DISTANCE] = 'SET_COMBAT_DISTANCE'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_CASTER_COMBAT_DIST] = 'SET_CASTER_COMBAT_DIST'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_HOVER] = 'SET_HOVER'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ADD_IMMUNITY] = 'ADD_IMMUNITY'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.REMOVE_IMMUNITY] = 'REMOVE_IMMUNITY'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.FALL] = 'FALL'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.SET_EVENT_FLAG_RESET] = 'SET_EVENT_FLAG_RESET'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.STOP_MOTION] = 'STOP_MOTION'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.NO_ENVIRONMENT_UPDATE] = 'NO_ENVIRONMENT_UPDATE'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.ZONE_UNDER_ATTACK] = 'ZONE_UNDER_ATTACK'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.LOAD_GRID] = 'LOAD_GRID'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.MUSIC] = 'MUSIC'; // TODO
SAI_ACTION_TOOLTIPS[SAI_ACTIONS.RANDOM_MUSIC] = 'RANDOM_MUSIC'; // TODO


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

export const EVENT_PARAM1_TEXTS = [];
// TODO: add missing values

export const EVENT_PARAM2_TEXTS = [];
// TODO: add missing values

export const EVENT_PARAM3_TEXTS = [];
// TODO: add missing values

export const EVENT_PARAM4_TEXTS = [];
// TODO: add missing values

export const EVENT_PARAM5_TEXTS = [];
// TODO: add missing values

export const ACTION_PARAM1_TEXTS = [];
ACTION_PARAM1_TEXTS[SAI_ACTIONS.TALK] = 'GroupId';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_FACTION] = 'FactionId';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL] = 'Creature entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SOUND] = 'Sound id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.PLAY_EMOTE] = 'Emote id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.FAIL_QUEST] = 'Quest id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.OFFER_QUEST] = 'Quest id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_REACT_STATE] = 'React state';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ACTIVATE_GOBJECT] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RANDOM_EMOTE] = 'Emote id 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CAST] = 'Spell ID';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SUMMON_CREATURE] = 'Creature entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.THREAT_SINGLE_PCT] = 'Threat increase in pct';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.THREAT_ALL_PCT] = 'Threat increase in pct';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_AREAEXPLOREDOREVENTHAPPENS] = 'Quest id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RESERVED_16] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_EMOTE_STATE] = 'Emote id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_UNIT_FLAG] = 'Unit flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_UNIT_FLAG] = 'Unit flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.AUTO_ATTACK] = 'Start or stop (0 / 1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT] = 'Allow or disallow (0 / 1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_EVENT_PHASE] = 'Phasemask';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.INC_EVENT_PHASE] = 'Increment';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.EVADE] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.FLEE_FOR_ASSIST] = 'Say flee text (0 / 1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_GROUPEVENTHAPPENS] = 'Quest id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.COMBAT_STOP] = 'Creature id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVEAURASFROMSPELL] = 'Spell id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.FOLLOW] = 'Distance';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RANDOM_PHASE] = 'Phasemask 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RANDOM_PHASE_RANGE] = 'Phasemask 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RESET_GOBJECT] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_KILLEDMONSTER] = 'Creature entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_INST_DATA] = 'Field';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_INST_DATA64] = 'Field';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.UPDATE_TEMPLATE] = 'Creature entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.DIE] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_IN_COMBAT_WITH_ZONE] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_FOR_HELP] = 'Radius';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_SHEATH] = 'Sheath state';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.FORCE_DESPAWN] = 'Time to despawn (ms)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL] = 'Flat value';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL] = 'Creature entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_INGAME_PHASE_MASK] = 'Phasemask';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_DATA] = 'Field';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.MOVE_FORWARD] = 'Distance in yards';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_VISIBILITY] = 'Visible (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_ACTIVE] = 'Active (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ATTACK_START] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SUMMON_GO] = 'Gameobject entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.KILL_UNIT] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ACTIVATE_TAXI] = 'Taxi id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.WP_START] = 'Walk/run (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.WP_PAUSE] = 'Time (ms)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.WP_STOP] = 'Despawn time (ms)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ADD_ITEM] = 'Item entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_ITEM] = 'Item entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.INSTALL_AI_TEMPLATE] = 'Template entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_RUN] = 'Off/on (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_FLY] = 'Off/on (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_SWIM] = 'Off/on (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.TELEPORT] = 'Map id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_COUNTER] = 'Variable id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.STORE_TARGET_LIST] = 'Variable id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.WP_RESUME] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_ORIENTATION] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CREATE_TIMED_EVENT] = 'Event id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.PLAYMOVIE] = 'Movie entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.MOVE_TO_POS] = 'Point id (0 any)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RESPAWN_TARGET] = 'Respawn time (seconds)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.EQUIP] = 'Equip template entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CLOSE_GOSSIP] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.TRIGGER_TIMED_EVENT] = 'Event id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_TIMED_EVENT] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ADD_AURA] = 'Spell id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.OVERRIDE_SCRIPT_BASE_OBJECT] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RESET_SCRIPT_BASE_OBJECT] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_SCRIPT_RESET] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_RANGED_MOVEMENT] = 'Attack distance';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_TIMED_ACTIONLIST] = 'Script entry';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_NPC_FLAG] = 'Npc flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ADD_NPC_FLAG] = 'Npc flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_NPC_FLAG] = 'Npc flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SIMPLE_TALK] = 'Groupid';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.INVOKER_CAST] = 'Spell ID';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CROSS_CAST] = 'Spell ID';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_RANDOM_TIMED_ACTIONLIST] = 'Script entry 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.CALL_RANDOM_RANGE_TIMED_ACTIONLIST] = 'Script entry 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.RANDOM_MOVE] = 'Maximum distance';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1] = 'Unit field bytes 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_UNIT_FIELD_BYTES_1] = 'Unit field bytes 1';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.INTERRUPT_SPELL] = 'With delay (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SEND_GO_CUSTOM_ANIM] = 'Animation (0-255)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_DYNAMIC_FLAG] = 'Dynamic flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ADD_DYNAMIC_FLAG] = 'Dynamic flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_DYNAMIC_FLAG] = 'Dynamic flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.JUMP_TO_POS] = 'Speed XY';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SEND_GOSSIP_MENU] = 'Gossip menu id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.GO_SET_LOOT_STATE] = 'Gameobject state';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SEND_TARGET_TO_TARGET] = 'Target id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_HOME_POS] = ''; // TODO
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_HEALTH_REGEN] = 'Off/on (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_ROOT] = 'Unroot/root (0/1)';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_GO_FLAG] = 'Gameobject flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ADD_GO_FLAG] = 'Gameobject flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_GO_FLAG] = 'Gameobject flags';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SUMMON_CREATURE_GROUP] = 'Summon group id';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.SET_POWER] = 'Power type';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.ADD_POWER] = 'Power type';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.REMOVE_POWER] = 'Power type';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.GAME_EVENT_STOP] = 'Id of the event';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.GAME_EVENT_START] = 'Id of the event';
ACTION_PARAM1_TEXTS[SAI_ACTIONS.START_CLOSEST_WAYPOINT] = 'Waypoint 1';
// TODO: add missing values

export const ACTION_PARAM2_TEXTS = [];
// TODO: add missing values

export const ACTION_PARAM3_TEXTS = [];
// TODO: add missing values

export const ACTION_PARAM4_TEXTS = [];
// TODO: add missing values

export const ACTION_PARAM5_TEXTS = [];
// TODO: add missing values

export const ACTION_PARAM6_TEXTS = [];
// TODO: add missing values

export const TARGET_PARAM1_TEXTS = [];
// TODO: add missing values

export const TARGET_PARAM2_TEXTS = [];
// TODO: add missing values

export const TARGET_PARAM3_TEXTS = [];
// TODO: add missing values

export const TARGET_PARAM4_TEXTS = [];
// TODO: add missing values


export const EVENT_PARAM1_TOOLTIPS = [];
// TODO: add missing values

export const EVENT_PARAM2_TOOLTIPS = [];
// TODO: add missing values

export const EVENT_PARAM3_TOOLTIPS = [];
// TODO: add missing values

export const EVENT_PARAM4_TOOLTIPS = [];
// TODO: add missing values

export const EVENT_PARAM5_TOOLTIPS = [];
// TODO: add missing values

export const ACTION_PARAM1_TOOLTIPS = [];
// TODO: add missing values

export const ACTION_PARAM2_TOOLTIPS = [];
// TODO: add missing values

export const ACTION_PARAM3_TOOLTIPS = [];
// TODO: add missing values

export const ACTION_PARAM4_TOOLTIPS = [];
// TODO: add missing values

export const ACTION_PARAM5_TOOLTIPS = [];
// TODO: add missing values

export const ACTION_PARAM6_TOOLTIPS = [];
// TODO: add missing values

export const TARGET_PARAM1_TOOLTIPS = [];
// TODO: add missing values

export const TARGET_PARAM2_TOOLTIPS = [];
// TODO: add missing values

export const TARGET_PARAM3_TOOLTIPS = [];
// TODO: add missing values

export const TARGET_PARAM4_TOOLTIPS = [];
// TODO: add missing values

