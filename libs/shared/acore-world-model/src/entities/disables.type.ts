import { TableRow } from '@keira/shared/constants';

export const DISABLES_TABLE = 'disables';
export const DISABLES_ID = 'sourceType';
export const DISABLES_ID_2 = 'entry';

export class Disables extends TableRow {
  sourceType: number = 0;
  entry: number = 0;
  flags: number = 0;
  params_0: string = '';
  params_1: string = '';
  comment: string = '';
}
