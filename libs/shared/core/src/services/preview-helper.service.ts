import { Injectable } from '@angular/core';
import { RACES_TEXT } from '@keira/shared/constants';

export const enum RACE {
  HUMAN = 0x001,
  ORC = 0x002,
  DWARF = 0x004,
  NIGHTELF = 0x008,
  UNDEAD = 0x010,
  TAUREN = 0x020,
  GNOME = 0x040,
  TROLL = 0x080,
  BLOODELF = 0x200,
  DRAENEI = 0x400,
  MASK_ALLIANCE = 0x44d,
  MASK_HORDE = 0x2b2,
  MASK_ALL = 0x6ff,
}

export const enum CLASSES {
  WARRIOR = 0x001,
  PALADIN = 0x002,
  HUNTER = 0x004,
  ROGUE = 0x008,
  PRIEST = 0x010,
  DEATHKNIGHT = 0x020,
  SHAMAN = 0x040,
  MAGE = 0x080,
  WARLOCK = 0x100,
  DRUID = 0x400,
  MASK_ALL = 0x5ff,
}

@Injectable({ providedIn: 'root' })
export class PreviewHelperService {
  public formatMoney(qty: number): string {
    let money = '';

    if (qty >= 10000) {
      const g = Math.floor(qty / 10000);
      money += `<span class="moneygold">${g}</span> &nbsp;`;
      qty -= g * 10000;
    }

    if (qty >= 100) {
      const s = Math.floor(qty / 100);
      money += `<span class="moneysilver">${s}</span> &nbsp;`;
      qty -= s * 100;
    }

    money += `<span class="moneycopper">${qty}</span> &nbsp;`;

    return money;
  }

  public getFactionFromRace(raceMask: number): string {
    if (raceMask === RACE.MASK_HORDE) {
      return RACES_TEXT['-2'];
    }

    if (raceMask === RACE.MASK_ALLIANCE) {
      return RACES_TEXT['-1'];
    }

    return null;
  }

  public getRaceString(raceMask: number): any[] {
    // clamp to available races
    raceMask &= RACE.MASK_ALL;
    // available to all races (we don't display 'both factions')
    if (!raceMask || raceMask === RACE.MASK_ALL) {
      return null;
    }

    const faction = this.getFactionFromRace(raceMask);

    if (!!faction) {
      return [faction];
    }

    const tmp = [];
    let i = 1;
    while (raceMask) {
      if (raceMask & (1 << (i - 1))) {
        /* istanbul ignore else */
        if (!!i) {
          tmp.push(i);
        }
        raceMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }

  public getRequiredClass(classMask: number): number[] {
    classMask &= CLASSES.MASK_ALL; // clamp to available classes..

    if (classMask === CLASSES.MASK_ALL) {
      // available to all classes
      return null;
    }

    const tmp = [];
    let i = 1;
    while (classMask) {
      if (classMask & (1 << (i - 1))) {
        /* istanbul ignore else */
        if (!!i) {
          tmp.push(i);
        }

        classMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }
}
