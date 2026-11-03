import { TableRow } from '@keira/shared/constants';

export const AREATRIGGER_SCRIPTS_TABLE = 'areatrigger_scripts';
export const AREATRIGGER_SCRIPTS_ID = 'entry';

export class AreatriggerScripts extends TableRow {
  entry: number = 0;
  ScriptName: string = '';
}
