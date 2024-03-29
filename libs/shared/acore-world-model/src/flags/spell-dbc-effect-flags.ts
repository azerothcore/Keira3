import { Flag } from '@keira/shared/constants';

export const SPELL_DBC_TARGETS: Flag[] = [
  { bit: 0, name: 'TARGET_FLAG_UNUSED_1' },
  { bit: 1, name: 'TARGET_FLAG_UNIT' },
  { bit: 2, name: 'TARGET_FLAG_UNIT_RAID - Unit in Raid' },
  { bit: 3, name: 'TARGET_FLAG_UNIT_PARTY - Unit in Party' },
  { bit: 4, name: 'TARGET_FLAG_ITEM - Item Enchantment' },
  { bit: 5, name: 'TARGET_FLAG_SOURCE_LOCATION - Blank AoE source location' },
  { bit: 6, name: 'TARGET_FLAG_DEST_LOCATION - Target AoE destination location' },
  { bit: 7, name: 'TARGET_FLAG_UNIT_ENEMY' },
  { bit: 8, name: 'TARGET_FLAG_UNIT_ALLY' },
  { bit: 9, name: 'TARGET_FLAG_CORPSE_ENEMY - Corpse of an Enemy' },
  { bit: 10, name: 'TARGET_FLAG_UNIT_DEAD - Dead Unit' },
  { bit: 11, name: 'TARGET_FLAG_GAMEOBJECT' },
  { bit: 12, name: 'TARGET_FLAG_TRADE_ITEM' },
  { bit: 13, name: 'TARGET_FLAG_STRING' },
  { bit: 14, name: 'TARGET_FLAG_GAMEOBJECT_ITEM' },
  { bit: 15, name: 'TARGET_FLAG_CORPSE_ALLY - Corpse of an ally' },
  { bit: 16, name: 'TARGET_FLAG_UNIT_MINIPET' },
  { bit: 17, name: 'TARGET_FLAG_GLYPH_SLOT' },
  { bit: 18, name: 'TARGET_FLAG_DEST_TARGET - Destination target' },
  { bit: 19, name: 'TARGET_FLAG_UNUSED20' },
  { bit: 20, name: 'TARGET_FLAG_UNIT_PASSENGER' },
];

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

export const SPELL_DBC_CLASS_MASK_FLAGS: Flag[] = [
  { bit: 0, name: '0x00000001' },
  { bit: 1, name: '0x00000002' },
  { bit: 2, name: '0x00000004' },
  { bit: 3, name: '0x00000008' },
  { bit: 4, name: '0x00000010' },
  { bit: 5, name: '0x00000020' },
  { bit: 6, name: '0x00000040' },
  { bit: 7, name: '0x00000080' },
  { bit: 8, name: '0x00000100' },
  { bit: 9, name: '0x00000200' },
  { bit: 10, name: '0x0000400' },
  { bit: 11, name: '0x00000800' },
  { bit: 12, name: '0x00001000' },
  { bit: 13, name: '0x00002000' },
  { bit: 14, name: '0x00004000' },
  { bit: 15, name: '0x00008000' },
  { bit: 16, name: '0x00010000' },
  { bit: 17, name: '0x00020000' },
  { bit: 18, name: '0x00040000' },
  { bit: 19, name: '0x00080000' },
  { bit: 20, name: '0x00100000' },
  { bit: 21, name: '0x00200000' },
  { bit: 22, name: '0x00400000' },
  { bit: 23, name: '0x00800000' },
  { bit: 24, name: '0x01000000' },
  { bit: 25, name: '0x02000000' },
  { bit: 26, name: '0x04000000' },
  { bit: 27, name: '0x08000000' },
  { bit: 28, name: '0x10000000' },
  { bit: 29, name: '0x20000000' },
  { bit: 30, name: '0x40000000' },
  { bit: 31, name: '0x80000000' },
];
