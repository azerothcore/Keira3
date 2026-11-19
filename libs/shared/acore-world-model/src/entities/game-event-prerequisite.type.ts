import { TableRow } from '@keira/shared/constants';

export const GAME_EVENT_PREREQUISITE_TABLE = 'game_event_prerequisite';
export const GAME_EVENT_PREREQUISITE_ID = 'eventEntry';
export const GAME_EVENT_PREREQUISITE_ID_2 = 'prerequisite_event';

export class GameEventPrerequisite extends TableRow {
  eventEntry: number = 0;
  prerequisite_event: number = 0;
}
