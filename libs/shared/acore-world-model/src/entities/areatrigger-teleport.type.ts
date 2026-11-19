import { TableRow } from '@keira/shared/constants';

export const AREATRIGGER_TELEPORT_TABLE = 'areatrigger_teleport';
export const AREATRIGGER_TELEPORT_ID = 'ID';
export const AREATRIGGER_TELEPORT_NAME = 'Name';
export const AREATRIGGER_TELEPORT_SEARCH_FIELDS = [AREATRIGGER_TELEPORT_ID, AREATRIGGER_TELEPORT_NAME];
export const AREATRIGGER_TELEPORT_CUSTOM_STARTING_ID = 10000;

export class AreatriggerTeleport extends TableRow {
  ID: number = 0;
  Name: string = '';
  target_map: number = 0;
  target_position_x: number = 0;
  target_position_y: number = 0;
  target_position_z: number = 0;
  target_orientation: number = 0;
}
