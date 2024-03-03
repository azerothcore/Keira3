import { TableRow } from '../../../keira-shared-constants/src/types/general';

export const SKILL_TABLE = 'skills'; // sqlite
export const SKILL_ID = 'id';
export const SKILL_SEARCH_FIELDS = [SKILL_ID, 'name'];

export class Skill extends TableRow {
  id: number = 0;
  name: string = '';
}
