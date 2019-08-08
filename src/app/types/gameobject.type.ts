import { TableRow } from './general';

export const SPAWNS_TABLE = 'gameobject';
export const SPAWNS_ID = 'id';
export const SPAWNS_ID_2 = 'guid';

export class GameObject extends TableRow {
  guid: number = 0;
  id: number = 0;
  map: number = 0;
  zoneId: number = 0;
  areaId: number = 0;
  spawnMask: number = 1;
  phaseMask: number = 1;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  orientation: number = 0;
  rotation0: number = 0;
  rotation1: number = 0;
  rotation2: number = 0;
  rotation3: number = 0;
  spawntimesecs: number = 0;
  animprogress: number = 0;
  state: number = 0;
  ScriptName: string = '';
  VerifiedBuild: number = 0;
}
