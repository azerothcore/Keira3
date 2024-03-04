import { TableRow } from '../../../constants/src/types/general';

export const CREATURE_SPAWN_TABLE = 'creature';
export const CREATURE_SPAWN_ID = 'id1';
export const CREATURE_SPAWN_ID_2 = 'guid';

export class CreatureSpawn extends TableRow {
  guid: number = 0;
  id1: number = 0;
  id2: number = 0;
  id3: number = 0;
  map: number = 0;
  zoneId: number = 0;
  areaId: number = 0;
  spawnMask: number = 1;
  phaseMask: number = 1;
  equipment_id: number = 0;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  orientation: number = 0;
  spawntimesecs: number = 120;
  wander_distance: number = 0;
  currentwaypoint: number = 0;
  curhealth: number = 1;
  curmana: number = 0;
  MovementType: number = 0;
  npcflag: number = 0;
  unit_flags: number = 0;
  dynamicflags: number = 0;
  ScriptName: string = '';
  VerifiedBuild: number = 0;
}
