import { Option } from '../../types/general';

export const EMOTE: Option[] = [
  { value: 0, name: 'ONESHOT_NONE' },
  { value: 1, name: 'ONESHOT_TALK' },
  { value: 2, name: 'ONESHOT_BOW' },
  { value: 3, name: 'ONESHOT_WAVE' },
  { value: 4, name: 'ONESHOT_CHEER' },
  { value: 5, name: 'ONESHOT_EXCLAMATION' },
  { value: 6, name: 'ONESHOT_QUESTION' },
  { value: 7, name: 'ONESHOT_EAT' },
  { value: 10, name: 'STATE_DANCE' },
  { value: 11, name: 'ONESHOT_LAUGH' },
  { value: 12, name: 'STATE_SLEEP' },
  { value: 13, name: 'STATE_SIT' },
  { value: 14, name: 'ONESHOT_RUDE' },
  { value: 15, name: 'ONESHOT_ROAR' },
  { value: 16, name: 'ONESHOT_KNEEL' },
  { value: 17, name: 'ONESHOT_KISS' },
  { value: 18, name: 'ONESHOT_CRY' },
  { value: 19, name: 'ONESHOT_CHICKEN' },
  { value: 20, name: 'ONESHOT_BEG' },
  { value: 21, name: 'ONESHOT_APPLAUD' },
  { value: 22, name: 'ONESHOT_SHOUT' },
  { value: 23, name: 'ONESHOT_FLEX' },
  { value: 24, name: 'ONESHOT_SHY' },
  { value: 25, name: 'ONESHOT_POINT' },
  { value: 26, name: 'STATE_STAND' },
  { value: 27, name: 'STATE_READY_UNARMED' },
  { value: 28, name: 'STATE_WORK_SHEATHED' },
  { value: 29, name: 'STATE_POINT' },
  { value: 30, name: 'STATE_NONE' },
  { value: 33, name: 'ONESHOT_WOUND' },
  { value: 34, name: 'ONESHOT_WOUND_CRITICAL' },
  { value: 35, name: 'ONESHOT_ATTACK_UNARMED' },
  { value: 36, name: 'ONESHOT_ATTACK1H' },
  { value: 37, name: 'ONESHOT_ATTACK2HTIGHT' },
  { value: 38, name: 'ONESHOT_ATTACK2H_LOOSE' },
  { value: 39, name: 'ONESHOT_PARRY_UNARMED' },
  { value: 43, name: 'ONESHOT_PARRY_SHIELD' },
  { value: 44, name: 'ONESHOT_READY_UNARMED' },
  { value: 45, name: 'ONESHOT_READY1H' },
  { value: 48, name: 'ONESHOT_READY_BOW' },
  { value: 50, name: 'ONESHOT_SPELL_PRECAST' },
  { value: 51, name: 'ONESHOT_SPELL_CAST' },
  { value: 53, name: 'ONESHOT_BATTLE_ROAR' },
  { value: 54, name: 'ONESHOT_SPECIALATTACK1H' },
  { value: 60, name: 'ONESHOT_KICK' },
  { value: 61, name: 'ONESHOT_ATTACK_THROWN' },
  { value: 64, name: 'STATE_STUN' },
  { value: 65, name: 'STATE_DEAD' },
  { value: 66, name: 'ONESHOT_SALUTE' },
  { value: 68, name: 'STATE_KNEEL' },
  { value: 69, name: 'STATE_USE_STANDING' },
  { value: 70, name: 'ONESHOT_WAVE_NO_SHEATHE' },
  { value: 71, name: 'ONESHOT_CHEER_NO_SHEATHE' },
  { value: 92, name: 'ONESHOT_EAT_NO_SHEATHE' },
  { value: 93, name: 'STATE_STUN_NO_SHEATHE' },
  { value: 94, name: 'ONESHOT_DANCE' },
  { value: 113, name: 'ONESHOT_SALUTE_NO_SHEATH' },
  { value: 133, name: 'STATE_USE_STANDING_NO_SHEATHE' },
  { value: 153, name: 'ONESHOT_LAUGH_NO_SHEATHE' },
  { value: 173, name: 'STATE_WORK' },
  { value: 193, name: 'STATE_SPELL_PRECAST' },
  { value: 213, name: 'ONESHOT_READY_RIFLE' },
  { value: 214, name: 'STATE_READY_RIFLE' },
  { value: 233, name: 'STATE_WORK_MINING' },
  { value: 234, name: 'STATE_WORK_CHOPWOOD' },
  { value: 253, name: 'STATE_APPLAUD' },
  { value: 254, name: 'ONESHOT_LIFTOFF' },
  { value: 273, name: 'ONESHOT_YES' },
  { value: 274, name: 'ONESHOT_NO' },
  { value: 275, name: 'ONESHOT_TRAIN' },
  { value: 293, name: 'ONESHOT_LAND' },
  { value: 313, name: 'STATE_AT_EASE' },
  { value: 333, name: 'STATE_READY1H' },
  { value: 353, name: 'STATE_SPELL_KNEEL_START' },
  { value: 373, name: 'STATE_SUBMERGED' },
  { value: 374, name: 'ONESHOT_SUBMERGE' },
  { value: 375, name: 'STATE_READY2H' },
  { value: 376, name: 'STATE_READY_BOW' },
  { value: 377, name: 'ONESHOT_MOUNT_SPECIAL' },
  { value: 378, name: 'STATE_TALK' },
  { value: 379, name: 'STATE_FISHING' },
  { value: 380, name: 'ONESHOT_FISHING' },
  { value: 381, name: 'ONESHOT_LOOT' },
  { value: 382, name: 'STATE_WHIRLWIND' },
  { value: 383, name: 'STATE_DROWNED' },
  { value: 384, name: 'STATE_HOLD_BOW' },
  { value: 385, name: 'STATE_HOLD_RIFLE' },
  { value: 386, name: 'STATE_HOLD_THROWN' },
  { value: 387, name: 'ONESHOT_DROWN' },
  { value: 388, name: 'ONESHOT_STOMP' },
  { value: 389, name: 'ONESHOT_ATTACK_OFF' },
  { value: 390, name: 'ONESHOT_ATTACK_OFF_PIERCE' },
  { value: 391, name: 'STATE_ROAR' },
  { value: 392, name: 'STATE_LAUGH' },
  { value: 393, name: 'ONESHOT_CREATURE_SPECIAL' },
  { value: 394, name: 'ONESHOT_JUMPLANDRUN' },
  { value: 395, name: 'ONESHOT_JUMPEND' },
  { value: 396, name: 'ONESHOT_TALK_NO_SHEATHE' },
  { value: 397, name: 'ONESHOT_POINT_NO_SHEATHE' },
  { value: 398, name: 'STATE_CANNIBALIZE' },
  { value: 399, name: 'ONESHOT_JUMPSTART' },
  { value: 400, name: 'STATE_DANCESPECIAL' },
  { value: 401, name: 'ONESHOT_DANCESPECIAL' },
  { value: 402, name: 'ONESHOT_CUSTOM_SPELL_01' },
  { value: 403, name: 'ONESHOT_CUSTOM_SPELL_02' },
  { value: 404, name: 'ONESHOT_CUSTOM_SPELL_03' },
  { value: 405, name: 'ONESHOT_CUSTOM_SPELL_04' },
  { value: 406, name: 'ONESHOT_CUSTOM_SPELL_05' },
  { value: 407, name: 'ONESHOT_CUSTOM_SPELL_06' },
  { value: 408, name: 'ONESHOT_CUSTOM_SPELL_07' },
  { value: 409, name: 'ONESHOT_CUSTOM_SPELL_08' },
  { value: 410, name: 'ONESHOT_CUSTOM_SPELL_09' },
  { value: 411, name: 'ONESHOT_CUSTOM_SPELL_10' },
  { value: 412, name: 'STATE_EXCLAIM' },
  { value: 413, name: 'STATE_DANCE_CUSTOM' },
  { value: 415, name: 'STATE_SIT_CHAIR_MED' },
  { value: 416, name: 'STATE_CUSTOM_SPELL_01' },
  { value: 417, name: 'STATE_CUSTOM_SPELL_02' },
  { value: 418, name: 'STATE_EAT' },
  { value: 419, name: 'STATE_CUSTOM_SPELL_04' },
  { value: 420, name: 'STATE_CUSTOM_SPELL_03' },
  { value: 421, name: 'STATE_CUSTOM_SPELL_05' },
  { value: 422, name: 'STATE_SPELLEFFECT_HOLD' },
  { value: 423, name: 'STATE_EAT_NO_SHEATHE' },
  { value: 424, name: 'STATE_MOUNT' },
  { value: 425, name: 'STATE_READY2HL' },
  { value: 426, name: 'STATE_SIT_CHAIR_HIGH' },
  { value: 427, name: 'STATE_FALL' },
  { value: 428, name: 'STATE_LOOT' },
  { value: 429, name: 'STATE_SUBMERGED_NEW' },
  { value: 430, name: 'ONESHOT_COWER' },
  { value: 431, name: 'STATE_COWER' },
  { value: 432, name: 'ONESHOT_USE_STANDING' },
  { value: 433, name: 'STATE_STEALTH_STAND' },
  { value: 434, name: 'ONESHOT_OMNICAST_GHOUL' },
  { value: 435, name: 'ONESHOT_ATTACK_BOW' },
  { value: 436, name: 'ONESHOT_ATTACK_RIFLE' },
  { value: 437, name: 'STATE_SWIM_IDLE' },
  { value: 438, name: 'STATE_ATTACK_UNARMED' },
  { value: 439, name: 'ONESHOT_SPELL_CAST_W_SOUND' },
  { value: 440, name: 'ONESHOT_DODGE' },
  { value: 441, name: 'ONESHOT_PARRY1H' },
  { value: 442, name: 'ONESHOT_PARRY2H' },
  { value: 443, name: 'ONESHOT_PARRY2HL' },
  { value: 444, name: 'STATE_FLYFALL' },
  { value: 445, name: 'ONESHOT_FLYDEATH' },
  { value: 446, name: 'STATE_FLY_FALL' },
  { value: 447, name: 'ONESHOT_FLY_SIT_GROUND_DOWN' },
  { value: 448, name: 'ONESHOT_FLY_SIT_GROUND_UP' },
  { value: 449, name: 'ONESHOT_EMERGE' },
  { value: 450, name: 'ONESHOT_DRAGON_SPIT' },
  { value: 451, name: 'STATE_SPECIAL_UNARMED' },
  { value: 452, name: 'ONESHOT_FLYGRAB' },
  { value: 453, name: 'STATE_FLYGRABCLOSED' },
  { value: 454, name: 'ONESHOT_FLYGRABTHROWN' },
  { value: 455, name: 'STATE_FLY_SIT_GROUND' },
  { value: 456, name: 'STATE_WALK_BACKWARDS' },
  { value: 457, name: 'ONESHOT_FLYTALK' },
  { value: 458, name: 'ONESHOT_FLYATTACK1H' },
  { value: 459, name: 'STATE_CUSTOM_SPELL_08' },
  { value: 460, name: 'ONESHOT_FLY_DRAGON_SPIT' },
  { value: 461, name: 'STATE_SIT_CHAIR_LOW' },
  { value: 462, name: 'ONESHOT_STUN' },
  { value: 463, name: 'ONESHOT_SPELL_CAST_OMNI' },
  { value: 465, name: 'STATE_READY_THROWN' },
  { value: 466, name: 'ONESHOT_WORK_CHOPWOOD' },
  { value: 467, name: 'ONESHOT_WORK_MINING' },
  { value: 468, name: 'STATE_SPELL_CHANNEL_OMNI' },
  { value: 469, name: 'STATE_SPELL_CHANNEL_DIRECTED' },
  { value: 470, name: 'STAND_STATE_NONE' },
  { value: 471, name: 'STATE_READYJOUST' },
  { value: 473, name: 'STATE_STRANGULATE' },
  { value: 474, name: 'STATE_READY_SPELL_OMNI' },
  { value: 475, name: 'STATE_HOLD_JOUST' },
  { value: 476, name: 'ONESHOT_CRY_JAINA' },
];
