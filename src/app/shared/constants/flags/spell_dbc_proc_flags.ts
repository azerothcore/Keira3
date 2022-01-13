import { Flag } from '../../types/general';

export const SPELL_DBC_PROC_FLAGS: Flag[] = [
  { bit: 0, name: 'PROC_FLAG_KILLED - On Death' },
  { bit: 1, name: 'PROC_FLAG_KILL - On target killed (yielding XP or Honor)' },
  { bit: 2, name: 'PROC_FLAG_DONE_MELEE_AUTO_ATTACK - On melee attack done' },
  { bit: 3, name: 'PROC_FLAG_TAKEN_MELEE_AUTO_ATTACK - On melee attack received' },
  { bit: 4, name: 'PROC_FLAG_DONE_SPELL_MELEE_DMG_CLASS - On physical ability damage done' },
  { bit: 5, name: 'PROC_FLAG_TAKEN_SPELL_MELEE_DMG_CLASS - On physical ability damage taken' },
  { bit: 6, name: 'PROC_FLAG_DONE_RANGED_AUTO_ATTACK - On ranged auto attack done' },
  { bit: 7, name: 'PROC_FLAG_TAKEN_RANGED_AUTO_ATTACK - On ranged auto attack taken' },
  { bit: 8, name: 'PROC_FLAG_DONE_SPELL_RANGED_DMG_CLASS - On ranged ability damage done' },
  { bit: 9, name: 'PROC_FLAG_TAKEN_SPELL_RANGED_DMG_CLASS - On ranged ability damage taken' },
  { bit: 10, name: 'PROC_FLAG_DONE_SPELL_NONE_DMG_CLASS_POS - On heal done (SpellDamageType NONE)' },
  { bit: 11, name: 'PROC_FLAG_TAKEN_SPELL_NONE_DMG_CLASS_POS - On heal taken (SpellDamageType NONE)' },
  { bit: 12, name: 'PROC_FLAG_DONE_SPELL_NONE_DMG_CLASS_NEG - On spell damage done (SpellDamageType NONE)' },
  { bit: 13, name: 'PROC_FLAG_TAKEN_SPELL_NONE_DMG_CLASS_NEG - On spell damage taken (SpellDamageType NONE)' },
  { bit: 14, name: 'PROC_FLAG_DONE_SPELL_MAGIC_DMG_CLASS_POS - On heal done (SpellDamageType MAGIC)' },
  { bit: 15, name: 'PROC_FLAG_TAKEN_SPELL_MAGIC_DMG_CLASS_POS - On heal taken (SpellDamageType MAGIC)' },
  { bit: 16, name: 'PROC_FLAG_DONE_SPELL_MAGIC_DMG_CLASS_NEG - On spell damage done (SpellDamageType MAGIC)' },
  { bit: 17, name: 'PROC_FLAG_TAKEN_SPELL_MAGIC_DMG_CLASS_NEG - On spell damage taken (SpellDamageType MAGIC)' },
  { bit: 18, name: 'PROC_FLAG_DONE_PERIODIC - On periodic effect done (Damage/Heal)' },
  { bit: 19, name: 'PROC_FLAG_TAKEN_PERIODIC - On periodic effect taken (Damage/Heal)' },
  { bit: 20, name: 'PROC_FLAG_TAKEN_DAMAGE - On any damage taken' },
  { bit: 20, name: 'PROC_FLAG_DONE_TRAP_ACTIVATION - On trap trigger' },
  { bit: 20, name: 'PROC_FLAG_DONE_MAINHAND_ATTACK - On main hand auto attack hit' },
  { bit: 20, name: 'PROC_FLAG_DONE_OFFHAND_ATTACK - On offhand auto attack hit' },
  { bit: 20, name: 'PROC_FLAG_DEATH - On death' },
];
