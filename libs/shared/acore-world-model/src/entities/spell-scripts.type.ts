import { TableRow } from '@keira/shared/constants';

/** `spell_scripts`: no key of its own; its rows are told apart by their effIndex, delay, command and data. */
export const SPELL_SCRIPTS_TABLE = 'spell_scripts';
export const SPELL_SCRIPTS_ID = 'id';
export const SPELL_SCRIPTS_ID_2 = 'effIndex';
export const SPELL_SCRIPTS_ID_3 = 'delay';
export const SPELL_SCRIPTS_SEARCH_FIELDS = [SPELL_SCRIPTS_ID, 'command', 'datalong'];

export class SpellScripts extends TableRow {
  id: number = 0;
  effIndex: number = 0;
  delay: number = 0;
  command: number = 0;
  datalong: number = 0;
  datalong2: number = 0;
  dataint: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  o: number = 0;
}
