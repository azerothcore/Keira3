import { TableRow } from '@keira/shared/constants';

export const SPELL_AREA_TABLE = 'spell_area';
export const SPELL_AREA_ID = 'spell';
export const SPELL_AREA_ID_2 = 'area';
export const SPELL_AREA_ID_3 = 'quest_start';

export class SpellArea extends TableRow {
  spell: number = 0;
  area: number = 0;
  quest_start: number = 0;
  quest_end: number = 0;
  aura_spell: number = 0;
  racemask: number = 0;
  gender: number = 2;
  autocast: number = 0;
  quest_start_status: number = 64;
  quest_end_status: number = 11;
}
