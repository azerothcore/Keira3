import { TableRow } from '@keira/shared/constants';

export const AREATRIGGER_TAVERN_TABLE = 'areatrigger_tavern';
export const AREATRIGGER_TAVERN_ID = 'id';

export class AreatriggerTavern extends TableRow {
  id: number = 0;
  name: string = '';
  faction: number = 0;
}
