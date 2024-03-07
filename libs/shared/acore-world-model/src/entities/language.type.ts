import { TableRow } from '@keira/shared/constants';

export const LANGUAGE_TABLE = 'languages'; // sqlite
export const LANGUAGE_ID = 'id';
export const LANGUAGE_SEARCH_FIELDS = [LANGUAGE_ID, 'name'];

export class Language extends TableRow {
  id: number = 0;
  name: string = '';
}
