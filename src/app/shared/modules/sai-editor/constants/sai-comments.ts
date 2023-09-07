import { SAI_ACTIONS } from './sai-actions';
import { SAI_EVENTS } from './sai-event';

export const SAI_EVENT_COMMENTS = [];
SAI_EVENT_COMMENTS[SAI_EVENTS.UPDATE_IC] = `In Combat`;
SAI_EVENT_COMMENTS[SAI_EVENTS.UPDATE_OOC] = `Out of Combat`;
SAI_EVENT_COMMENTS[SAI_EVENTS.HEALTH_PCT] = `Between _eventParamOne_-_eventParamTwo_% Health`;
SAI_EVENT_COMMENTS[SAI_EVENTS.MANA_PCT] = `Between _eventParamOne_-_eventParamTwo_% Mana`;
SAI_EVENT_COMMENTS[SAI_EVENTS.AGGRO] = `On Aggro`;
SAI_EVENT_COMMENTS[SAI_EVENTS.KILL] = `On Killed Unit`;
SAI_EVENT_COMMENTS[SAI_EVENTS.DEATH] = `On Just Died`;
SAI_EVENT_COMMENTS[SAI_EVENTS.EVADE] = `On Evade`;
SAI_EVENT_COMMENTS[SAI_EVENTS.SPELLHIT] = `On Spellhit '_spellNameEventParamOne_'`;
SAI_EVENT_COMMENTS[SAI_EVENTS.RANGE] = `Within _eventParamOne_-_eventParamTwo_ Range`;
SAI_EVENT_COMMENTS[SAI_EVENTS.OOC_LOS] = `Within _eventParamOne_-_eventParamTwo_ Range Out of Combat LoS`;
SAI_EVENT_COMMENTS[SAI_EVENTS.RESPAWN] = `On Respawn`;
SAI_EVENT_COMMENTS[SAI_EVENTS.TARGET_HEALTH_PCT] = `Target Between _eventParamOne_-_eventParamTwo_% Health`;
SAI_EVENT_COMMENTS[SAI_EVENTS.VICTIM_CASTING] = `On Victim Casting '_targetCastingSpellName_'`;
SAI_EVENT_COMMENTS[SAI_EVENTS.FRIENDLY_HEALTH] = `Friendly At _eventParamOne_ Health`;
SAI_EVENT_COMMENTS[SAI_EVENTS.FRIENDLY_IS_CC] = `On Friendly Crowd Controlled`;
SAI_EVENT_COMMENTS[SAI_EVENTS.FRIENDLY_MISSING_BUFF] = `On Friendly Unit Missing Buff '_spellNameEventParamOne_'`;
SAI_EVENT_COMMENTS[SAI_EVENTS.SUMMONED_UNIT] = `On Summoned Unit`;
SAI_EVENT_COMMENTS[SAI_EVENTS.TARGET_MANA_PCT] = `Target Between _eventParamOne_-_eventParamTwo_% Mana`;
SAI_EVENT_COMMENTS[SAI_EVENTS.ACCEPTED_QUEST] = `On Quest '_questNameEventParamOne_' Taken`;
SAI_EVENT_COMMENTS[SAI_EVENTS.REWARD_QUEST] = `On Quest '_questNameEventParamOne_' Finished`;
SAI_EVENT_COMMENTS[SAI_EVENTS.REACHED_HOME] = `On Reached Home`;
SAI_EVENT_COMMENTS[SAI_EVENTS.RECEIVE_EMOTE] = `Received Emote _eventParamOne_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.HAS_AURA] = `On Aura '_hasAuraEventParamOne_'`;
SAI_EVENT_COMMENTS[SAI_EVENTS.TARGET_BUFFED] = `On Target Buffed With '_spellNameEventParamOne_'`;
SAI_EVENT_COMMENTS[SAI_EVENTS.RESET] = `On Reset`;
SAI_EVENT_COMMENTS[SAI_EVENTS.IC_LOS] = `In Combat LoS`;
SAI_EVENT_COMMENTS[SAI_EVENTS.PASSENGER_BOARDED] = `On Passenger Boarded`;
SAI_EVENT_COMMENTS[SAI_EVENTS.PASSENGER_REMOVED] = `On Passenger Removed`;
SAI_EVENT_COMMENTS[SAI_EVENTS.CHARMED] = `On Charmed`;
SAI_EVENT_COMMENTS[SAI_EVENTS.CHARMED_TARGET] = `On Target Charmed`;
SAI_EVENT_COMMENTS[SAI_EVENTS.SPELLHIT_TARGET] = `On Target Spellhit '_spellNameEventParamOne_'`;
SAI_EVENT_COMMENTS[SAI_EVENTS.DAMAGED] = `On Damaged Between _eventParamOne_-_eventParamTwo_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.DAMAGED_TARGET] = `On Target Damaged Between _eventParamOne_-_eventParamTwo_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.MOVEMENTINFORM] = `On Reached Point _eventParamTwo_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.SUMMON_DESPAWNED] = `On Summon _npcNameFirstParam_ Despawned`;
SAI_EVENT_COMMENTS[SAI_EVENTS.CORPSE_REMOVED] = `On Corpse Removed`;
SAI_EVENT_COMMENTS[SAI_EVENTS.AI_INIT] = `On Initialize`;
SAI_EVENT_COMMENTS[SAI_EVENTS.DATA_SET] = `On Data Set _eventParamOne_ _eventParamTwo_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.WAYPOINT_START] = `On Path _waypointParamTwo_ Started`;
SAI_EVENT_COMMENTS[SAI_EVENTS.WAYPOINT_REACHED] = `On Point _waypointParamOne_ of Path _waypointParamTwo_ Reached`;
SAI_EVENT_COMMENTS[SAI_EVENTS.AREATRIGGER_ONTRIGGER] = `On Trigger`;
SAI_EVENT_COMMENTS[SAI_EVENTS.TEXT_OVER] = `On Text _eventParamOne_ Over`;
SAI_EVENT_COMMENTS[SAI_EVENTS.RECEIVE_HEAL] = `On Received Heal Between _eventParamOne_-_eventParamTwo_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.JUST_SUMMONED] = `On Just Summoned`;
SAI_EVENT_COMMENTS[SAI_EVENTS.WAYPOINT_PAUSED] = `On Path _eventParamTwo_ Paused`;
SAI_EVENT_COMMENTS[SAI_EVENTS.WAYPOINT_RESUMED] = `On Path _eventParamTwo_ Resumed`;
SAI_EVENT_COMMENTS[SAI_EVENTS.WAYPOINT_STOPPED] = `On Path _eventParamTwo_ Stopped`;
SAI_EVENT_COMMENTS[SAI_EVENTS.WAYPOINT_ENDED] = `On Path _eventParamTwo_ Finished`;
SAI_EVENT_COMMENTS[SAI_EVENTS.TIMED_EVENT_TRIGGERED] = `On Timed Event _eventParamOne_ Triggered`;
SAI_EVENT_COMMENTS[SAI_EVENTS.UPDATE] = `On Update`;
SAI_EVENT_COMMENTS[SAI_EVENTS.LINK] = `_previousLineComment_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.GOSSIP_SELECT] = `On Gossip Option _eventParamTwo_ Selected`;
SAI_EVENT_COMMENTS[SAI_EVENTS.JUST_CREATED] = `On Just Created`;
SAI_EVENT_COMMENTS[SAI_EVENTS.GOSSIP_HELLO] = `On Gossip Hello`;
SAI_EVENT_COMMENTS[SAI_EVENTS.FOLLOW_COMPLETED] = `On Follow Complete`;
SAI_EVENT_COMMENTS[SAI_EVENTS.EVENT_PHASE_CHANGE] = `On Event Phase _eventParamOne_ Set`;
SAI_EVENT_COMMENTS[SAI_EVENTS.IS_BEHIND_TARGET] = `On Behind Target`;
SAI_EVENT_COMMENTS[SAI_EVENTS.GAME_EVENT_START] = `On Game Event _eventParamOne_ Started`;
SAI_EVENT_COMMENTS[SAI_EVENTS.GAME_EVENT_END] = `On Game Event _eventParamOne_ Ended`;
SAI_EVENT_COMMENTS[SAI_EVENTS.GO_STATE_CHANGED] = `On Gameobject State Changed`;
SAI_EVENT_COMMENTS[SAI_EVENTS.GO_EVENT_INFORM] = `On Event _eventParamOne_ Inform`;
SAI_EVENT_COMMENTS[SAI_EVENTS.ACTION_DONE] = `On Action _eventParamOne_ Done`;
SAI_EVENT_COMMENTS[SAI_EVENTS.ON_SPELLCLICK] = `On Spellclick`;
SAI_EVENT_COMMENTS[SAI_EVENTS.FRIENDLY_HEALTH_PCT] = `On Friendly Between _eventParamOne_-_eventParamTwo_% Health`;
SAI_EVENT_COMMENTS[SAI_EVENTS.DISTANCE_CREATURE] = `On Distance _eventParamThree_y To Creature`;
SAI_EVENT_COMMENTS[SAI_EVENTS.DISTANCE_GAMEOBJECT] = `On Distance _eventParamThree_y To GameObject`;
SAI_EVENT_COMMENTS[SAI_EVENTS.COUNTER_SET] = `On Counter _eventParamOne_ Set To _eventParamTwo_`;
SAI_EVENT_COMMENTS[SAI_EVENTS.SUMMONED_UNIT_DIES] = `On Summoned Unit Dies`;

// AC-only Events:
SAI_EVENT_COMMENTS[SAI_EVENTS.NEAR_PLAYERS] = `On _eventParamOne_ or More Players in Range`;
SAI_EVENT_COMMENTS[SAI_EVENTS.NEAR_PLAYERS_NEGATION] = `On Less Than _eventParamOne_ Players in Range`;
SAI_EVENT_COMMENTS[SAI_EVENTS.NEAR_UNIT] = `On _eventParamThree_ or More Units in Range`;
SAI_EVENT_COMMENTS[SAI_EVENTS.NEAR_UNIT_NEGATION] = `On Less Than _eventParamThree_ Units in Range`;
SAI_EVENT_COMMENTS[SAI_EVENTS.AREA_CASTING] = `On Hostile Casting in Range`;
SAI_EVENT_COMMENTS[SAI_EVENTS.AREA_RANGE] = `On Hostile in Range`;

export const SAI_ACTION_COMMENTS = [];
SAI_ACTION_COMMENTS[SAI_ACTIONS.NONE] = `No Action Type`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.TALK] = `Say Line _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_FACTION] = `Set Faction _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.MORPH_TO_ENTRY_OR_MODEL] = `_morphToEntryOrModelActionParams_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SOUND] = `Play Sound _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.PLAY_EMOTE] = `Play Emote _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FAIL_QUEST] = `Fail Quest '_questNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.OFFER_QUEST] = `Add Quest '_questNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_REACT_STATE] = `Set Reactstate _reactStateParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ACTIVATE_GOBJECT] = `Activate Gameobject`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RANDOM_EMOTE] = `Play Random Emote (_actionRandomParameters_)`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CAST] = `Cast '_spellNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SUMMON_CREATURE] = `Summon Creature '_creatureNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.THREAT_SINGLE_PCT] = `Set Single Threat _actionParamOne_-_actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.THREAT_ALL_PCT] = `Set All Threat _actionParamOne_-_actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_AREAEXPLOREDOREVENTHAPPENS] = `Quest Credit '_questNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_EMOTE_STATE] = `Set Emote State _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_UNIT_FLAG] = `Set Flag_getUnitFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_UNIT_FLAG] = `Remove Flag_getUnitFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.AUTO_ATTACK] = `_startOrStopActionParamOne_ Attacking`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ALLOW_COMBAT_MOVEMENT] = `_enableDisableActionParamOne_ Combat Movement`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_EVENT_PHASE] = `Set Event Phase _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.INC_EVENT_PHASE] = `_incrementOrDecrementActionParamOne_ Phase`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.EVADE] = `Evade`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FLEE_FOR_ASSIST] = `Flee For Assist`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_GROUPEVENTHAPPENS] = `Quest Credit '_questNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.COMBAT_STOP] = `Stop Combat`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVEAURASFROMSPELL] = `Remove Aura '_spellNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FOLLOW] = `_startOrStopBasedOnTargetType_ Follow _getTargetType_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RANDOM_PHASE] = `Set Random Phase (_actionRandomParameters_)`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RANDOM_PHASE_RANGE] = `Set Phase Random Between _actionParamOne_-_actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RESET_GOBJECT] = `Reset Gameobject`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_KILLEDMONSTER] = `Quest Credit '_questNameKillCredit_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_INST_DATA] = `Set Instance Data _actionParamOne_ to _actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_INST_DATA64] = `Set Instance Data _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.UPDATE_TEMPLATE] = `Update Template To '_creatureNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.DIE] = `Kill Self`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_IN_COMBAT_WITH_ZONE] = `Set In Combat With Zone`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_FOR_HELP] = `Call For Help`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_SHEATH] = `Set Sheath _sheathActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FORCE_DESPAWN] = `Despawn _forceDespawnActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_INVINCIBILITY_HP_LEVEL] = `_invincibilityHpActionParamsOneTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.MOUNT_TO_ENTRY_OR_MODEL] = `_mountToEntryOrModelActionParams_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_DATA] = `Set Data _actionParamOne_ _actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.MOVE_FORWARD] = `Move Forward _actionParamOne_ Yards`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_VISIBILITY] = `Set Visibility _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_ACTIVE] = `Set Active _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ATTACK_START] = `Start Attacking`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SUMMON_GO] = `Summon Gameobject _gameobjectNameActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.KILL_UNIT] = `Kill Target`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ACTIVATE_TAXI] = `Activate Taxi Path _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.WP_START] = `Start _waypointStartActionParamThree_Path _actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.WP_PAUSE] = `Pause Waypoint`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.WP_STOP] = `Stop Waypoint`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_ITEM] = `Add Item _addItemBasedOnActionParams_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_ITEM] = `Remove Item _addItemBasedOnActionParams_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.INSTALL_AI_TEMPLATE] = `Install _updateAiTemplateActionParamOne_ Template`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_RUN] = `Set Run _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_FLY] = `Set Fly _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_SWIM] = `Set Swim _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.TELEPORT] = `Teleport`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_COUNTER] = `Add _actionParamTwo_ to Counter Id _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.STORE_TARGET_LIST] = `Store Targetlist`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.WP_RESUME] = `Resume Waypoint`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_ORIENTATION] = `Set Orientation _setOrientationTargetType_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CREATE_TIMED_EVENT] = `Create Timed Event`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.PLAYMOVIE] = `Play Movie _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.MOVE_TO_POS] = `Move To _getTargetType_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RESPAWN_TARGET] = `Respawn _getTargetType_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.EQUIP] = `Change Equipment`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CLOSE_GOSSIP] = `Close Gossip`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.TRIGGER_TIMED_EVENT] = `Trigger Timed Event _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_TIMED_EVENT] = `Remove Timed Event _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_AURA] = `Add Aura '_spellNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.OVERRIDE_SCRIPT_BASE_OBJECT] = `Override Base Object Script`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RESET_SCRIPT_BASE_OBJECT] = `Reset Base Object Script`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_SCRIPT_RESET] = `Reset All Scripts`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_RANGED_MOVEMENT] = `Set Ranged Movement`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_TIMED_ACTIONLIST] = `Run Script`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_NPC_FLAG] = `Set Npc Flag_getNpcFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_NPC_FLAG] = `Add Npc Flag_getNpcFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_NPC_FLAG] = `Remove Npc Flag_getNpcFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SIMPLE_TALK] = `Say Line _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SELF_CAST] = `Self Cast '_spellNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CROSS_CAST] = `Cross Cast '_spellNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_RANDOM_TIMED_ACTIONLIST] = `Run Random Script`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CALL_RANDOM_RANGE_TIMED_ACTIONLIST] = `Run Random Script`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RANDOM_MOVE] = `Start Random Movement`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_UNIT_FIELD_BYTES_1] = `Set Flag _getBytes1Flags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_UNIT_FIELD_BYTES_1] = `Remove Flag_getBytes1Flags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.INTERRUPT_SPELL] = `Interrupt Spell '_spellNameActionParamTwo_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SEND_GO_CUSTOM_ANIM] = `Send Custom Animation _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_DYNAMIC_FLAG] = `Set Dynamic Flag_getDynamicFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_DYNAMIC_FLAG] = `Add Dynamic Flag_getDynamicFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_DYNAMIC_FLAG] = `Remove Dynamic Flag_getDynamicFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.JUMP_TO_POS] = `Jump To Pos`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SEND_GOSSIP_MENU] = `Send Gossip`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.GO_SET_LOOT_STATE] = `Set Lootstate _goStateActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SEND_TARGET_TO_TARGET] = `Send Target _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_HOME_POS] = `Set Home Position`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_HEALTH_REGEN] = `Set Health Regeneration _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_ROOT] = `Set Rooted _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_GO_FLAG] = `Set Gameobject Flag_getGoFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_GO_FLAG] = `Add Gameobject Flag_getGoFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_GO_FLAG] = `Remove Gameobject Flag_getGoFlags_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SUMMON_CREATURE_GROUP] = `Summon Creature Group _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_POWER] = `Set _powerTypeActionParamOne_ To _actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_POWER] = `Add _actionParamTwo_ _powerTypeActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_POWER] = `Remove _actionParamTwo_ _powerTypeActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.GAME_EVENT_STOP] = `Stop game event _actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.GAME_EVENT_START] = `Start game event _actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.START_CLOSEST_WAYPOINT] = `Pick Closest Waypoint _actionParamOne_ _actionParamTwo_ _actionParamThree_ _actionParamFour_ _actionParamFive_ _actionParamSix_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RISE_UP] = `Move Up`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RANDOM_SOUND] = `Play Random Sound`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_CORPSE_DELAY] = `Set Corpse Delay to _actionParamOne_s`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.DISABLE_EVADE] = `_enableDisableInvertActionParamOne_ Evade`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.GO_SET_GO_STATE] = `Set GO State To _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_SIGHT_DIST] = `Set Sight Distance to _actionParamOne_y`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FLEE] = `Flee`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_THREAT] = `Modify Threat`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.LOAD_EQUIPMENT] = `Load Equipment Id _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.TRIGGER_RANDOM_TIMED_EVENT] = `Trigger Random Timed Event Between _actionParamOne_-_actionParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_ALL_GAMEOBJECTS] = `Remove All Gameobjects`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.INVOKER_CAST] = `Invoker Cast '_spellNameActionParamOne_'`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.PLAY_CINEMATIC] = `Play Cinematic`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_MOVEMENT_SPEED] = `Set _movementTypeActionParamOne_ Speed to _actionParamTwo_._actionParamThree_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_HEALTH_PCT] = `Set HP to _actionParamOne_%`;

// AC-only actions:
SAI_ACTION_COMMENTS[SAI_ACTIONS.MOVE_TO_POS_TARGET] = `Move to pos target _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.EXIT_VEHICLE] = `Exit vehicle`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_UNIT_MOVEMENT_FLAGS] = `Set unit movement flags to _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_COMBAT_DISTANCE] = `Set combat distance to _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_CASTER_COMBAT_DIST] = `Set caster combat distance to _actionParamOne_ (RestToMax: _actionParamTwo_)`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_HOVER] = `Set hover _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ADD_IMMUNITY] = `Add immunity Type: _actionParamOne_, Id: _actionParamTwo_, Value: _actionParamThree_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.REMOVE_IMMUNITY] =
  `Remove immunity Type: _actionParamOne_, Id: _actionParamTwo_, Value: _actionParamThree_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FALL] = `Fall`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_EVENT_FLAG_RESET] = `Flag reset _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.STOP_MOTION] = `Stop motion (StopMoving: _actionParamOne_, MovementExpired: _actionParamTwo_)`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.NO_ENVIRONMENT_UPDATE] = `No environment update`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ZONE_UNDER_ATTACK] = `Zone under attack`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.LOAD_GRID] = `Load Grid`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.MUSIC] = `Play music SoundId: _actionParamOne_, OnlySelf: _actionParamTwo_, Type: _actionParamThree_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.RANDOM_MUSIC] = `Play random music OnlySelf: _actionParamFive_, Type: _actionParamSix_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CUSTOM_CAST] = `Custom Cast _spellNameActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CONE_SUMMON] = `Do Cone Summon`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.PLAYER_TALK] = `Player Talk String _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.VORTEX_SUMMON] = `Do Vortex Summon`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.CU_ENCOUNTER_START] = `Reset Cooldowns`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.DO_ACTION] = `Do Action ID _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ATTACK_STOP] = `Stop Attack`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_GUID] = `Send Guid`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.DISABLE] = `Set Creature _onOffActionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SET_SCALE] = `Set Scale to _actionParamOne_%`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.SUMMON_RADIAL] = `Do Radial Summon`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.PLAY_SPELL_VISUAL] = `Play Visual Kit Id _actionParamOne_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.FOLLOW_GROUP] = `Follow Type _followGroupParamTwo_`;
SAI_ACTION_COMMENTS[SAI_ACTIONS.ORIENTATION_TARGET] = `Set Target Orientation`;
