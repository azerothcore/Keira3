import { Option } from '@keira/shared/constants';

/** `waypoint_data.move_type`. */
export const WAYPOINT_MOVE_TYPE: Option[] = [
  { value: 0, name: 'WALK' },
  { value: 1, name: 'RUN' },
  { value: 2, name: 'LAND' },
  { value: 3, name: 'TAKEOFF' },
];

/** `waypoint_scripts.command`: AzerothCore's ScriptCommands (ScriptMgr.h). */
export const WAYPOINT_SCRIPT_COMMAND: Option[] = [
  { value: 0, name: 'TALK (datalong: chat type, dataint: broadcast_text id)' },
  { value: 1, name: 'EMOTE (datalong: emote id)' },
  { value: 2, name: 'FIELD_SET (datalong: field, datalong2: value)' },
  { value: 3, name: 'MOVE_TO (x, y, z; datalong2: time in ms)' },
  { value: 4, name: 'FLAG_SET (datalong: field, datalong2: flag)' },
  { value: 5, name: 'FLAG_REMOVE (datalong: field, datalong2: flag)' },
  { value: 6, name: 'TELEPORT_TO (datalong: map; x, y, z, o)' },
  { value: 7, name: 'QUEST_EXPLORED (datalong: quest id, datalong2: distance)' },
  { value: 8, name: 'KILL_CREDIT (datalong: creature entry)' },
  { value: 9, name: 'RESPAWN_GAMEOBJECT (datalong: gameobject guid, datalong2: despawn delay)' },
  { value: 10, name: 'TEMP_SUMMON_CREATURE (datalong: entry, datalong2: despawn delay; x, y, z, o)' },
  { value: 11, name: 'OPEN_DOOR (datalong: gameobject guid, datalong2: reset delay)' },
  { value: 12, name: 'CLOSE_DOOR (datalong: gameobject guid, datalong2: reset delay)' },
  { value: 13, name: 'ACTIVATE_OBJECT' },
  { value: 14, name: 'REMOVE_AURA (datalong: spell id)' },
  { value: 15, name: 'CAST_SPELL (datalong: spell id, datalong2: target)' },
  { value: 16, name: 'PLAY_SOUND (datalong: sound id)' },
  { value: 17, name: 'CREATE_ITEM (datalong: item entry, datalong2: count)' },
  { value: 18, name: 'DESPAWN_SELF (datalong: delay in ms)' },
  { value: 20, name: 'LOAD_PATH (datalong: path id, datalong2: repeatable)' },
  { value: 21, name: 'CALLSCRIPT_TO_UNIT (datalong: creature entry, datalong2: script id)' },
  { value: 22, name: 'KILL (datalong2: remove corpse)' },
  { value: 30, name: 'ORIENTATION (o)' },
  { value: 31, name: 'EQUIP (datalong: creature_equip_template id)' },
  { value: 32, name: 'MODEL (datalong: display id)' },
  { value: 33, name: 'CLOSE_GOSSIP' },
  { value: 34, name: 'PLAYMOVIE (datalong: movie id)' },
  { value: 35, name: 'MOVEMENT (datalong: movement type, datalong2: path id)' },
];
