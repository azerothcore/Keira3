import { TableRow } from '@keira/shared/constants';

export const VEHICLE_ACCESSORY_TABLE = 'vehicle_accessory';
export const VEHICLE_ACCESSORY_ID_2 = 'guid';
export const VEHICLE_ACCESSORY_ID_3 = 'seat_id';

/** The creatures riding one vehicle spawn (by creature.guid), over its template's vehicle_template_accessory. */
export class VehicleAccessory extends TableRow {
  guid: number = 0;
  seat_id: number = 0;
  accessory_entry: number = 0;
  minion: number = 0;
  description: string = '';
  summontype: number = 6;
  summontimer: number = 30000;
}
