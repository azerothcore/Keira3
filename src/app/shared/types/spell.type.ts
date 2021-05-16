import { TableRow } from './general';

export const SPELL_TABLE = 'spells'; // sqlite
export const SPELL_ID = 'ID';
export const SPELL_NAME = 'spellName';
export const SPELL_SEARCH_FIELDS = [SPELL_ID, SPELL_NAME];

export class Spell extends TableRow {
  ID: number = 0;
  spellName: string = '';
}
