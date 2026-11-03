import { TableRow } from '@keira/shared/constants';

export const AREATRIGGER_TABLE = 'areatrigger';
export const AREATRIGGER_ID = 'entry';

export class Areatrigger extends TableRow {
  entry: number = 0;
  map: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  radius: number = 0;
  length: number = 0;
  width: number = 0;
  height: number = 0;
  orientation: number = 0;
}
