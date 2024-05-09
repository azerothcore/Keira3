import { TableRow } from '@keira/shared/constants';

export const SOUND_ENTRIES_TABLE = 'sound_entries'; // sqlite
export const SOUND_ENTRIES_ID = 'id';
export const SOUND_ENTRIES_SEARCH_FIELDS = [SOUND_ENTRIES_ID, 'name'];

export class SoundEntries extends TableRow {
  id: number = 0;
  name: string = '';
}
