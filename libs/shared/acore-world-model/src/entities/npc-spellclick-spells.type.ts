import { TableRow } from '@keira/shared/constants';

export const NPC_SPELLCLICK_SPELLS_TABLE = 'npc_spellclick_spells';
export const NPC_SPELLCLICK_SPELLS_ID = 'npc_entry';
export const NPC_SPELLCLICK_SPELLS_ID_2 = 'spell_id';

export class NpcSpellclickSpells extends TableRow {
  npc_entry: number = 0;
  spell_id: number = 0;
  cast_flags: number = 0;
  user_type: number = 0;
}
