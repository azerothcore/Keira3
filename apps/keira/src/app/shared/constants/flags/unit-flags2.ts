import { Flag } from '@keira/acore-world-model';

export const UNIT_FLAGS_2: Flag[] = [
  { bit: 0, name: 'FEIGN_DEATH' },
  { bit: 1, name: 'HIDE_BODY - Hide unit model (show only player equip)' },
  { bit: 2, name: 'IGNORE_REPUTATION' },
  { bit: 3, name: 'COMPREHEND_LANG' },
  { bit: 4, name: 'MIRROR_IMAGE' },
  { bit: 5, name: 'DO_NOT_FADE_IN - Unit model instantly appears when summoned (does not fade in)' },
  { bit: 6, name: 'FORCE_MOVEMENT' },
  { bit: 7, name: 'DISARM_OFFHAND' },
  { bit: 8, name: 'DISABLE_PRED_STATS - Player has disabled predicted stats (Used by raid frames)' },
  { bit: 10, name: 'DISARM_RANGED - this does not disable ranged weapon display (maybe additional flag needed?)' },
  { bit: 11, name: 'REGENERATE_POWER' },
  { bit: 12, name: 'RESTRICT_PARTY_INTERACT - Restrict interaction to party or raid' },
  { bit: 13, name: 'PREVENT_SPELL_CLICK - Prevent spellclick' },
  { bit: 14, name: 'ALLOW_ENEMY_INTERACT' },
  { bit: 15, name: 'CANNOT_TURN' },
  { bit: 16, name: 'UNK2' },
  { bit: 17, name: 'PLAY_DEATH_ANIM - Plays special death animation upon death' },
  { bit: 18, name: 'ALLOW_CHEAT_SPELLS - Allows casting spells with AttributesEx7 & SPELL_ATTR7_IS_CHEAT_SPELL' },
];
