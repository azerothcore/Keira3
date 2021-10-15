import { TableRow } from './general';

export const FACTION_TABLE = 'factions'; // sqlite
export const FACTION_ID = 'm_ID';
export const FACTION_SEARCH_FIELDS = [FACTION_ID, 'faction_name_id', 'm_name_lang_1'];

export class Faction extends TableRow {
  m_ID: number = 0;
  m_name_lang_1: string = '';
  faction_name_id: number = 0;
}
