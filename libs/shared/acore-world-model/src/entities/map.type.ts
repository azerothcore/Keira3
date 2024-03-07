import { TableRow } from '@keira/shared/constants';

export const MAP_TABLE = 'maps'; // sqlite
export const MAP_ID = 'm_ID';
export const MAP_SEARCH_FIELDS = [MAP_ID, 'm_MapName_lang1'];

export class Map extends TableRow {
  m_ID: number = 0;
  m_MapName_lang1: string = '';
}
