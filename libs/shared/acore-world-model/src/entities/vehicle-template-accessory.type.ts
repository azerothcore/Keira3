import { TableRow } from '@keira/shared/constants';

export const VEHICLE_TEMPLATE_ACCESSORY_TABLE = 'vehicle_template_accessory';
export const VEHICLE_TEMPLATE_ACCESSORY_ID = 'entry';
export const VEHICLE_TEMPLATE_ACCESSORY_ID_2 = 'seat_id';

export class VehicleTemplateAccessory extends TableRow {
  entry: number = 0;
  seat_id: number = 0;
  accessory_entry: number = 0;
  minion: number = 0;
  description: string = '';
  summontype: number = 6;
  summontimer: number = 30000;
}
