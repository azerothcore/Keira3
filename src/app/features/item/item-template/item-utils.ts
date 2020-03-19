import { ITEM_MOD } from '@keira-shared/constants/options/item-class';

export const MAX_LEVEL = 80;

export const lvlIndepRating = [        // rating doesn't scale with level
  ITEM_MOD.MANA,
  ITEM_MOD.HEALTH,
  ITEM_MOD.ATTACK_POWER,
  ITEM_MOD.MANA_REGENERATION,
  ITEM_MOD.SPELL_POWER,
  ITEM_MOD.HEALTH_REGEN,
  ITEM_MOD.SPELL_PENETRATION,
  ITEM_MOD.BLOCK_VALUE,
];

export const gtCombatRatings = {
  12: 1.5,
  13: 13.8,
  14: 13.8,
  15: 5,
  16: 10,
  17: 10,
  18: 8,
  19: 14,
  20: 14,
  21: 14,
  22: 10,
  23: 10,
  24: 8,
  25: 0,
  26: 0,
  27: 0,
  28: 10,
  29: 10,
  30: 10,
  31: 10,
  32: 14,
  33: 0,
  34: 0,
  35: 28.75,
  36: 10,
  37: 2.5,
  44: 4.26,
};

export const resistanceFields = [
  // null,
  'holy',
  'fire',
  'nature',
  'frost',
  'shadow',
  'arcane',
];

export enum CLASSES {
  WARRIOR     = 0x001,
  PALADIN     = 0x002,
  HUNTER      = 0x004,
  ROGUE       = 0x008,
  PRIEST      = 0x010,
  DEATHKNIGHT = 0x020,
  SHAMAN      = 0x040,
  MAGE        = 0x080,
  WARLOCK     = 0x100,
  DRUID       = 0x400,
  MASK_ALL    = 0x5FF,
}

// TODO: delete this useless function
// export function fmod(a: number, b: number) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); }

export enum RACE {
  HUMAN         = 0x001,
  ORC           = 0x002,
  DWARF         = 0x004,
  NIGHTELF      = 0x008,
  UNDEAD        = 0x010,
  TAUREN        = 0x020,
  GNOME         = 0x040,
  TROLL         = 0x080,
  BLOODELF      = 0x200,
  DRAENEI       = 0x400,
  MASK_ALLIANCE = 0x44D,
  MASK_HORDE    = 0x2B2,
  MASK_ALL      = 0x6FF,
}

/* export async function getLocks(lockId: number, queryService: QueryService) {
  let locks = [];
  let lock  = await selectRow('SELECT * FROM ?_lock WHERE id = ?d', lockId);
  if (!lock) {
    return locks;
  }

  for (let i = 1; i <= 5; i++) {
    let prop = lock['properties' + i];
    let rank = lock['reqSkill' + i];
    let name = '';

    if (lock['type' + i] === 1) {                      // opened by item
      name = await queryService.getItemNameById(prop);
      if (!name) {
        continue;
      }

    } else if (lock['type'.i] == 2) {                 // opened by skill
      // exclude unusual stuff
      if (!in_array(prop, [1, 2, 3, 4, 9, 16, 20])) {
        continue;
      }

      name = self::spell('lockType', prop);
      if (!name) {
        continue;
      }

      // if (interactive) {
      //     skill = 0;
      //     switch (prop) {
      //         case  1: skill = 633; break;       // Lockpicking
      //         case  2: skill = 182; break;       // Herbing
      //         case  3: skill = 186; break;       // Mining
      //         case 20: skill = 773; break;       // Scribing
      //     }

      //     if (skill) {
      //         name = '<a href="?skill='.skill.'">'.name.'</a>';
      //     }
      // }

      if (rank > 0) {
        name .= ' ('.rank.')';
      }
    } else {
      continue;
    }

    locks[lock['type'.i] == 1 ? prop : -prop] = sprintf(self::game('requires'), name);
  }

  return locks;
} */
