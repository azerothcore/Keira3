import { TableRow } from '@keira/shared/constants';

/** `event_scripts`: no key of its own; its rows are told apart by their delay, command and data. */
export const EVENT_SCRIPTS_TABLE = 'event_scripts';
export const EVENT_SCRIPTS_ID = 'id';
export const EVENT_SCRIPTS_ID_2 = 'delay';
export const EVENT_SCRIPTS_ID_3 = 'command';
export const EVENT_SCRIPTS_SEARCH_FIELDS = [EVENT_SCRIPTS_ID, 'command', 'datalong'];

export class EventScripts extends TableRow {
  id: number = 0;
  delay: number = 0;
  command: number = 0;
  datalong: number = 0;
  datalong2: number = 0;
  dataint: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  o: number = 0;
}
