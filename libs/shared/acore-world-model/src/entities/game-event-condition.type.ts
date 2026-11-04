import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_CONDITION_TABLE = 'game_event_condition';
export const GAME_EVENT_CONDITION_ID = 'eventEntry';
export const GAME_EVENT_CONDITION_ID_2 = 'condition_id';

export class GameEventCondition extends TableRow {
  eventEntry: number = 0;
  condition_id: number = 0;
  req_num: number = 0;
  max_world_state_field: number = 0;
  done_world_state_field: number = 0;
  description: string = '';
}
