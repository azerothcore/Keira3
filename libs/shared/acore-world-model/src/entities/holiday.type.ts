import { TableRow } from '../../../constants/src/types/general';

export const HOLIDAY_TABLE = 'holiday'; // sqlite
export const HOLIDAY_ID = 'id';
export const HOLIDAY_SEARCH_FIELDS = [HOLIDAY_ID, 'name'];

export class Holiday extends TableRow {
  id: number = 0;
  name: string = '';
}
