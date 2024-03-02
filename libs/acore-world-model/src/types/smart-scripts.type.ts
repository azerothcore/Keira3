import { TableRow } from './general';
import { getEnumKeys } from '../../../../apps/keira/src/app/shared/utils/helpers';

export const SAI_TABLE = 'smart_scripts';

export const SAI_ID_FIELDS = ['entryorguid', 'source_type'];
export const SAI_ID_2 = 'id';
export const SAI_SEARCH_FIELDS = SAI_ID_FIELDS;

export enum SAI_TYPES {
  SAI_TYPE_CREATURE,
  SAI_TYPE_GAMEOBJECT,
  SAI_TYPE_AREATRIGGER,
  SAI_TYPE_TIMED_ACTIONLIST = 9,
}
export const SAI_TYPES_KEYS = getEnumKeys(SAI_TYPES);

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
  event_param6: number = 0;
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
