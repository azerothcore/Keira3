import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_MODEL_EQUIP_TABLE = 'game_event_model_equip';
export const GAME_EVENT_MODEL_EQUIP_ID = 'eventEntry';
export const GAME_EVENT_MODEL_EQUIP_ID_2 = 'guid';

export class GameEventModelEquip extends TableRow {
  eventEntry: number = 0;
  guid: number = 0;
  modelid: number = 0;
  equipment_id: number = 0;
}
